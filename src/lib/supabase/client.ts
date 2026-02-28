import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for browser components.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing required NEXT_PUBLIC Supabase environment variables.",
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  );
}
