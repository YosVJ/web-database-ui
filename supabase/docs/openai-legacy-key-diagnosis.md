# Diagnosis: "Legacy API keys are disabled" after login

## What was inspected

- Frontend auth flow (`signInWithPassword`, `saveUserProfile`, and `profiles.upsert`).
- Language/profile sync flow that also upserts into `profiles`.
- All repository references to OpenAI and OpenAI endpoints.
- Supabase Edge Functions in this repo.
- SQL migrations in this repo.

## Findings

1. The app performs `profiles.upsert()` immediately after successful login.
2. There is no OpenAI client usage in frontend code.
3. There are no OpenAI HTTP calls in the only Edge Function (`inbound-webhook`).
4. The only OpenAI-related setting in the repo is `openai_api_key` under Supabase Studio config (used for Supabase Studio AI, not app auth/login).
5. The migrations folder does not define any triggers/functions in this repo.

## Root cause

The runtime error likely comes from **database-side logic that is not present in this repository** (for example: a trigger/function attached to `profiles` upsert in the hosted Supabase project), which calls OpenAI using a legacy key.

## Why timing matches

Because `profiles.upsert()` runs right after auth success, any trigger or RPC attached to `profiles` will execute post-login and can surface this error to the client.

## Required backend fix

In the Supabase project (remote DB), inspect and update/disable the post-login trigger/function chain:

- Replace legacy OpenAI key with a modern project key.
- Ensure endpoint usage is modern (`/v1/responses`) rather than legacy patterns.
- If the OpenAI side effect is unnecessary on login/profile sync, remove trigger coupling from `profiles` writes.

## Prioritized remote Supabase/backend checklist

1. **Supabase Auth logs (first check)**
   - Confirm `signInWithPassword` completes successfully for the affected user and timestamp.
   - Verify there is no auth-provider error at the same second as UI failure.

2. **Database logs and triggers (highest probability)**
   - Inspect triggers on `public.profiles` for `INSERT/UPDATE` side effects.
   - Inspect trigger function definitions for HTTP calls, `pg_net`, `http_post`, webhooks, or OpenAI references.
   - Correlate exact timestamp of UI error with Postgres log entries.

3. **Edge Function logs (deployed project, not just repo)**
   - Check all deployed functions for runtime errors containing:
     - `Legacy API keys are disabled`
     - `api.openai.com`
     - `completions`, `embeddings`, `responses`
   - Verify no old function version still deployed and referenced by DB/webhooks.

4. **Supabase Database Webhooks / Auth Hooks**
   - Review Dashboard settings for Database Webhooks and Auth Hooks invoking external endpoints.
   - Confirm hook destination URLs and secrets are current and expected.

5. **External automations/backends**
   - Audit n8n/Zapier/Make/server backends listening to Supabase events.
   - Rotate keys and migrate OpenAI calls to project-scoped keys + modern API usage.

## SQL to run in remote Supabase SQL editor

```sql
-- 1) Triggers on profiles/auth users
select event_object_table as table_name, trigger_name, action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table in ('profiles')
order by event_object_table, trigger_name;

-- 2) Functions that may call HTTP/OpenAI
select n.nspname as schema_name, p.proname as function_name, pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where pg_get_functiondef(p.oid) ilike any (array[
  '%openai%',
  '%api.openai.com%',
  '%responses%',
  '%completions%',
  '%embeddings%',
  '%http_post%',
  '%net.http%'
]);
```
