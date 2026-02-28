'use client';

import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthActionButtonProps {
  isAuthenticated: boolean;
}

/**
 * Handles profile auth actions without forcing client rendering for the whole page.
 */
export function AuthActionButton({
  isAuthenticated,
}: AuthActionButtonProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleClick = async () => {
    if (isAuthenticated) {
      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
      return;
    }

    router.push('/login?next=/profile');
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full font-bold h-12 rounded-full flex items-center justify-center gap-2 border transition-colors ${
        isAuthenticated
          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
          : 'bg-aura-primary text-black border-transparent hover:bg-aura-secondary'
      }`}
    >
      {isAuthenticated ? (
        <>
          <LogOut size={18} />
          Logout
        </>
      ) : (
        <>
          <LogIn size={18} />
          Login
        </>
      )}
    </button>
  );
}
