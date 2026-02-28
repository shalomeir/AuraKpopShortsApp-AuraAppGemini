import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Server-only service role client.
 * Used only for internal tasks that require bypassing RLS, like updating aggregate counts.
 */
export function createSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

