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

  return { userId: user.id, supabase };
}

