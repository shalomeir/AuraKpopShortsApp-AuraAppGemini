'use client';

import { UserCircle, Settings, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuth(Boolean(data.session));
    };

    loadSession();
  }, [supabase.auth]);

  const handleAuthAction = async () => {
    if (isAuth) {
      await supabase.auth.signOut();
      setIsAuth(false);
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Header */}
      <div className="p-4 pt-4 sticky top-0 z-10 bg-aura-surface/90 backdrop-blur-md flex items-center justify-between border-b border-aura-outline">
        <Link href="/">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </div>
        </Link>
        <h1 className="text-xl font-bold flex gap-2 items-center text-white">
          Profile
        </h1>
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
          <Settings size={24} />
        </div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center flex-1 mt-10">
        <div className="w-24 h-24 bg-aura-surfaceVariant rounded-[32px] mb-6 flex items-center justify-center border border-aura-outline shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <UserCircle size={48} className="text-aura-primary opacity-50" />
        </div>
        
        <h2 className="text-2xl font-black text-center text-white mb-2">
          {isAuth ? 'Your Account (Logged In)' : 'Your Account'}
        </h2>
        <p className="text-zinc-500 text-center text-[14px] px-6 mb-8 leading-relaxed">
          {isAuth 
            ? 'MVP Mockup: You are now locally authenticated.' 
            : 'Manage your account settings, followed characters, and your very own AI pop stars. User authentication is coming soon.'}
        </p>

        <button 
          onClick={handleAuthAction}
          className={`w-full font-bold h-12 rounded-full flex items-center justify-center gap-2 border transition-colors ${
            isAuth 
            ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
            : "bg-aura-primary text-black border-transparent hover:bg-aura-secondary"
          }`}
        >
          {isAuth ? (
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
      </div>
    </main>
  );
}
