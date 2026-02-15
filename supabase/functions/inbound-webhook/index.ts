import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Webhooks must be callable without Authorization header.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Only our shared secret authorizes this request.
  const secret = (req.headers.get("x-webhook-secret") ?? "").trim();
  if (!secret) {
    return new Response(JSON.stringify({ code: 401, message: "Missing x-webhook-secret" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ code: 400, message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const companyId = String(payload.company_id ?? "").trim();
  const eventType = String(payload.event ?? payload.event_type ?? "UNKNOWN").trim();
  if (!companyId) {
    return new Response(JSON.stringify({ code: 400, message: "Missing company_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // IMPORTANT: Use service role key so no Authorization header is needed.
  const sbUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SB_URL");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");

  if (!sbUrl || !serviceKey) {
    return new Response(JSON.stringify({ code: 500, message: "Server misconfigured (env)" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(sbUrl, serviceKey);

  // Hash incoming secret and compare to stored hash
  const incomingHash = await sha256Hex(secret);

  const { data: secretRow, error: secretErr } = await supabase
    .from("webhook_secrets")
    .select("id")
    .eq("provider", "inbound_webhook")
    .eq("company_id", companyId)
    .eq("active", true)
    .eq("secret_hash", incomingHash)
    .maybeSingle();

  if (secretErr) {
    return new Response(JSON.stringify({ code: 500, message: "Secret lookup failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!secretRow) {
    return new Response(JSON.stringify({ code: 401, message: "Invalid webhook secret" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: logged, error: logErr } = await supabase
    .from("webhook_events")
    .insert({
      provider: "inbound_webhook",
      company_id: companyId,
      event_type: eventType,
      payload,
      request_id: payload.request_id ?? payload.pr_no ?? null,
    })
    .select("id")
    .single();

  if (logErr) {
    return new Response(JSON.stringify({ code: 500, message: "Failed to log event" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, logged_event_id: logged.id, company_id: companyId, event: eventType }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
