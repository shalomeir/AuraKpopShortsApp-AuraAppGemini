import { NextRequest, NextResponse } from "next/server";
import {
  DEV_AUTH_COOKIE_NAME,
  isDevAuthBypassEnabled,
} from "@/lib/server/dev-auth";

export const runtime = "nodejs";

/**
 * Clears dev bypass auth cookie.
 */
export async function GET(request: NextRequest) {
  if (!isDevAuthBypassEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Dev auth bypass is disabled.",
        },
      },
      { status: 403 },
    );
  }

  const redirectTo = request.nextUrl.searchParams.get("next") ?? "/login";
  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const redirectUrl = new URL(
    redirectTo.startsWith("/") ? redirectTo : "/login",
    `${protocol}://${host}`,
  );

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(DEV_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
