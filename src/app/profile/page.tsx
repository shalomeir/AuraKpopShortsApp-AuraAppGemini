import { UserCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AuthActionButton } from './auth-action-button';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      <div className="p-4 pt-4 sticky top-0 z-10 bg-aura-surface/90 backdrop-blur-md flex items-center justify-between border-b border-aura-outline">
        <Link href="/">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </div>
        </Link>
        <h1 className="text-xl font-bold flex gap-2 items-center text-white">Profile</h1>
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
          <Settings size={24} />
        </div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center flex-1 mt-10">
        <div className="w-24 h-24 bg-aura-surfaceVariant rounded-[32px] mb-6 flex items-center justify-center border border-aura-outline shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <UserCircle size={48} className="text-aura-primary opacity-50" />
        </div>

        <h2 className="text-2xl font-black text-center text-white mb-2">
          {isAuthenticated ? 'Logged In' : 'Guest'}
        </h2>
        <p className="text-zinc-500 text-center text-[14px] px-6 mb-8 leading-relaxed">
          {isAuthenticated
            ? `Current signed-in account: ${user?.email ?? 'unknown'}`
            : 'Sign in with Google to use My Idols and Following.'}
        </p>

        <AuthActionButton isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
