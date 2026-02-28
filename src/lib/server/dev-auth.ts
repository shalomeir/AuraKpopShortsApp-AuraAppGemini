import { cookies } from "next/headers";

const DEV_AUTH_COOKIE = "aura_dev_user_id";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/**
 * Returns whether dev auth bypass is enabled.
 */
export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.DEV_AUTH_BYPASS_ENABLED === "true" ||
      process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED === "true")
  );
}

/**
 * Reads validated dev bypass user id from cookie.
 */
export function getDevBypassUserId(): string | null {
  if (!isDevAuthBypassEnabled()) return null;

  const cookieStore = cookies();
  const userId = cookieStore.get(DEV_AUTH_COOKIE)?.value?.trim();
  if (!userId || !isUuid(userId)) return null;

  return userId;
}

export const DEV_AUTH_COOKIE_NAME = DEV_AUTH_COOKIE;
