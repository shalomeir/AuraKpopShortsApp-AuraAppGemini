import Link from 'next/link';
import { Home, Trophy, Settings2, UserCircle } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 z-50 w-full md:max-w-md bg-aura-surface/90 backdrop-blur-md border-t border-aura-outline pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-aura-primary transition-colors min-h-[48px] min-w-[48px]">
          <Home size={24} />
          <span className="text-[10px] font-medium font-sans">Feed</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-aura-secondary transition-colors min-h-[48px] min-w-[48px]">
          <Trophy size={24} />
          <span className="text-[10px] font-medium font-sans">Ranking</span>
        </Link>
        <Link href="/manage" className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-aura-tertiary transition-colors min-h-[48px] min-w-[48px]">
          <Settings2 size={24} />
          <span className="text-[10px] font-medium leading-none whitespace-nowrap font-sans">Manage</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition-colors min-h-[48px] min-w-[48px]">
          <UserCircle size={24} />
          <span className="text-[10px] font-medium leading-none whitespace-nowrap font-sans">Profile</span>
        </Link>
      </div>
    </div>
  );
}
