import { NextRequest, NextResponse } from "next/server";
import { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Handles Supabase auth callback:
 * - OAuth code exchange
 * - Email verification token_hash verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";
  const supabase = createSupabaseServerClient();

  if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
