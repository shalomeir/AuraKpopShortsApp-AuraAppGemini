import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEV_AUTH_COOKIE_NAME,
  isDevAuthBypassEnabled,
} from "@/lib/server/dev-auth";

export const runtime = "nodejs";

/**
 * Dev-only auth bypass route.
 * Sets a server cookie so protected pages/APIs can run without OAuth during local testing.
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

  const userIdParam = request.nextUrl.searchParams.get("userId");
  const redirectTo = request.nextUrl.searchParams.get("next") ?? "/manage";

  const admin = createSupabaseAdminClient();

  let userId = userIdParam?.trim() ?? "";

  if (!userId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!profile?.id) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "No profile found for dev login bypass.",
          },
        },
        { status: 404 },
      );
    }

    userId = profile.id;
  }

  const { data: exists } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!exists?.id) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Profile not found for userId.",
        },
      },
      { status: 404 },
    );
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const redirectUrl = new URL(
    redirectTo.startsWith("/") ? redirectTo : "/manage",
    `${protocol}://${host}`,
  );

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(DEV_AUTH_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
