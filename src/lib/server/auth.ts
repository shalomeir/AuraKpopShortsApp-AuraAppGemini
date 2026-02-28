import { errorResponse } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUserResult {
  userId: string;
  supabase: ReturnType<typeof createSupabaseServerClient>;
}

/**
 * API 라우트에서 인증된 사용자 정보를 가져온다.
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

  return { userId: user.id, supabase };
}

