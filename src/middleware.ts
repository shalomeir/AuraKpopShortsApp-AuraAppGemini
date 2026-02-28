import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = ['/create', '/manage'];
const DEV_AUTH_COOKIE_NAME = 'aura_dev_user_id';

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const isDevBypassEnabled =
    process.env.NODE_ENV !== 'production' &&
    (process.env.DEV_AUTH_BYPASS_ENABLED === 'true' ||
      process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED === 'true');
  const hasDevBypassUser = Boolean(request.cookies.get(DEV_AUTH_COOKIE_NAME)?.value);

  const hasAuthCode = request.nextUrl.searchParams.has('code');
  const hasEmailOtp =
    request.nextUrl.searchParams.has('token_hash') &&
    request.nextUrl.searchParams.has('type');
  const isAuthCallbackPath = request.nextUrl.pathname === '/auth/callback';

  // If auth callback params land on the wrong path (e.g. "/?code=..."),
  // force redirect to the dedicated callback route so session exchange always runs.
  if ((hasAuthCode || hasEmailOtp) && !isAuthCallbackPath) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    callbackUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    isProtectedPath(request.nextUrl.pathname) &&
    !user &&
    !(isDevBypassEnabled && hasDevBypassUser)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
