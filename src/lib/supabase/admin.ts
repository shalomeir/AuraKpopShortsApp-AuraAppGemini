import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * 서버 전용 service role 클라이언트.
 * 집계 카운트 갱신처럼 RLS 우회가 필요한 내부 작업에서만 사용한다.
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

