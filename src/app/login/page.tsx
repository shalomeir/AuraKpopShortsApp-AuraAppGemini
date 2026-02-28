'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function normalizeAbsoluteUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return null;
  }
}

function resolveAuthBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Always use the current browser origin.
    // This supports localhost, production, and dynamic Vercel preview URLs.
    return window.location.origin;
  }

  return (
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_APP_URL_PRODUCTION) ??
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    'http://localhost:3000'
  );
}

function buildAuthRedirectUrl(baseUrl: string, nextPath: string): string {
  const rawRedirectPath =
    process.env.NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_PATH ?? '/auth/callback';
  let redirectPath = '/auth/callback';

  // Prevent absolute URL lock-in (e.g. Vercel URL in env).
  // We only keep path/query/fragment so current origin is always respected.
  if (rawRedirectPath.startsWith('http://') || rawRedirectPath.startsWith('https://')) {
    try {
      const parsed = new URL(rawRedirectPath);
      redirectPath = `${parsed.pathname}${parsed.search}${parsed.hash}` || '/auth/callback';
    } catch {
      redirectPath = '/auth/callback';
    }
  } else if (rawRedirectPath.startsWith('/')) {
    redirectPath = rawRedirectPath;
  }

  const redirectUrl = new URL(redirectPath, baseUrl);
  redirectUrl.searchParams.set('next', nextPath);
  return redirectUrl.toString();
}

function mapSupabaseAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('email rate limit exceeded')) {
    return 'Too many confirmation emails were sent. Please try again after 1 hour.';
  }

  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const nextPath = useMemo(() => {
    const next = searchParams.get('next');
    return next && next.startsWith('/') ? next : '/';
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugRedirectTo, setDebugRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(nextPath);
      }
    };

    checkSession();
  }, [supabase.auth, router, nextPath]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const appUrl = resolveAuthBaseUrl();
    const redirectTo = buildAuthRedirectUrl(appUrl, nextPath);
    if (process.env.NODE_ENV !== 'production') {
      setDebugRedirectTo(redirectTo);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      setErrorMessage(`Google sign-in failed: ${mapSupabaseAuthError(error.message)}`);
      setIsLoading(false);
      return;
    }
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-aura-surface items-center justify-center p-6 relative">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-aura-primary/10 to-transparent pointer-events-none" />

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        <h1 className="text-4xl font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-aura-primary to-aura-secondary">
          AURA
        </h1>
        <p className="text-zinc-400 text-sm mb-8 text-center">
          Continue with Google to sign in
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-full h-12 hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Continue with Google'}
        </button>

        {errorMessage ? (
          <p className="w-full mt-4 text-sm text-red-400 text-center">{errorMessage}</p>
        ) : null}
        {process.env.NODE_ENV !== 'production' && debugRedirectTo ? (
          <p className="w-full mt-3 text-[11px] text-zinc-500 break-all text-center">
            redirectTo: {debugRedirectTo}
          </p>
        ) : null}

        <button
          onClick={() => router.push('/')}
          disabled={isLoading}
          className="w-full mt-6 flex items-center justify-center font-bold text-zinc-300 rounded-full h-12 bg-aura-surfaceContainer border border-aura-outline hover:bg-aura-surfaceVariant transition-colors disabled:opacity-50"
        >
          Continue as Guest
        </button>
      </div>
    </main>
  );
}
