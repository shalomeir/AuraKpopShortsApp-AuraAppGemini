import { errorResponse } from "@/lib/api-response";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUserResult {
  userId: string;
  supabase: ReturnType<typeof createSupabaseServerClient>;
}

function buildUsernameFallback(
  userId: string,
  email: string | null | undefined,
): string | null {
  if (!email) return null;

  const base = email.split("@")[0]?.trim().toLowerCase();
  if (!base) return null;

  const sanitized = base.replace(/[^a-z0-9_]/g, "_").slice(0, 20);
  if (!sanitized) return null;

  return `${sanitized}_${userId.slice(0, 8)}`;
}

/**
 * Ensures profile row exists for authenticated users to satisfy FK constraints.
 */
async function ensureProfileExists(userId: string, email?: string | null) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      username: buildUsernameFallback(userId, email),
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
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

  try {
    await ensureProfileExists(user.id, user.email);
  } catch (profileError) {
    return errorResponse(
      "DB_ERROR",
      (profileError as Error).message,
      500,
    );
  }

  // Best effort: used for activity-based posting policy.
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  return { userId: user.id, supabase };
}
