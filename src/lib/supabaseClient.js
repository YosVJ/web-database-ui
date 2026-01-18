import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase env vars:", {
    supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "web-database-ui-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

