import { errorResponse } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUserResult {
  userId: string;
  supabase: ReturnType<typeof createSupabaseServerClient>;
}

/**
 * Retrieves authenticated user information from API route.
 */
export async function getAuthenticatedUser(): Promise<
  AuthUserResult | ReturnType<typeof errorResponse>
> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  // 사용자 활동 여부 기반 자동 포스팅 정책을 위해 마지막 접속 시간을 갱신한다.
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  return { userId: user.id, supabase };
}
