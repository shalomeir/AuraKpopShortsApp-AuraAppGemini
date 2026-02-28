import { getMockRanking } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowUp, Zap } from "lucide-react";

export default async function LeaderboardPage() {
  const rankings = await getMockRanking(10);
  
  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Header */}
      <div className="px-4 py-4 pt-4 sticky top-0 z-10 bg-aura-surface/90 backdrop-blur-md border-b border-aura-outline flex items-center gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white font-sans">
          <Trophy className="text-aura-secondary" size={24} />
          Rankings
        </h1>
      </div>

      {/* List */}
      <div className="flex flex-col p-4 gap-4">
        {rankings.map((char, i) => (
          <Link href={`/character/${char.id}`} key={char.id}>
            <div className="flex items-center bg-aura-surfaceVariant hover:bg-aura-surfaceContainer px-4 py-3 rounded-[16px] border border-aura-outline transition-colors group elevation-1 h-[72px]">
              <div className="flex items-center justify-center w-8 mr-2 relative">
                {i < 3 ? (
                  <div className="absolute inset-0 bg-aura-secondary/20 blur-md rounded-full shadow-[0_0_10px_rgba(138,92,255,0.8)]" />
                ) : null}
                <span className={`text-lg font-bold font-sans ${i < 3 ? "text-aura-secondary drop-shadow-[0_0_5px_rgba(138,92,255,0.8)]" : "text-zinc-500"} z-10 relative`}>
                  {i + 1}
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-aura-outline group-hover:border-aura-secondary transition-colors">
                <Image src={char.avatar_url || "/default-avatar.png"} alt={char.name} fill className="object-cover" />
              </div>
              <div className="flex-1 ml-4 flex flex-col justify-center">
                <h3 className="font-bold text-base text-white group-hover:text-aura-secondary transition-colors leading-tight">{char.name}</h3>
                <div className="flex gap-3 text-xs text-zinc-400 mt-1 font-medium">
                  <span className="flex items-center gap-1"><ArrowUp size={12} className="text-aura-tertiary"/> {char.follower_count.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Zap size={12} className="text-aura-primary"/> Lv.{char.fan_level}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
