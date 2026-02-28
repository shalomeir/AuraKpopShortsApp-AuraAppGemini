import Link from "next/link";
import Image from "next/image";
import { Settings2, Zap, ArrowUp } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ManagedCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  follower_count: number;
  fan_level: number;
}

export default async function ManagePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let chars: ManagedCharacter[] = [];
  if (user) {
    const { data } = await supabase
      .from("characters")
      .select("id, name, avatar_url, follower_count, fan_level")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    chars = (data ?? []) as ManagedCharacter[];
  }

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Header */}
      <div className="px-4 py-4 pt-4 sticky top-0 z-10 bg-aura-surface/90 backdrop-blur-md border-b border-aura-outline flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white font-sans">
          <Settings2 className="text-aura-primary" size={24} />
          Management
        </h1>
        <Link href="/create">
          <div className="px-3 py-1.5 bg-aura-primary/10 text-aura-primary text-sm font-bold rounded-full border border-aura-primary/30 hover:bg-aura-primary/20 transition-colors">
            + New
          </div>
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {chars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-aura-surfaceVariant border border-aura-outline rounded-[16px]">
            <Settings2 size={48} className="text-zinc-600 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No Characters Yet</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-[200px]">Create your first AI idol and start growing your fandom.</p>
            <Link href="/create" className="bg-aura-primary text-black font-bold py-3 px-6 rounded-full w-full max-w-[200px] hover:bg-aura-secondary transition-colors">
              Create AI Idol
            </Link>
          </div>
        ) : (
          chars.map((char) => (
             <Link href={`/manage/${char.id}`} key={char.id}>
              <div className="bg-aura-surfaceVariant border border-aura-outline rounded-[16px] p-4 flex gap-4 items-center hover:bg-aura-surfaceContainer transition-colors group">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-aura-outline">
                  <Image src={char.avatar_url || "/default-avatar.svg"} alt={char.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-white text-lg leading-tight group-hover:text-aura-primary transition-colors">{char.name}</h3>
                  <div className="flex gap-3 text-xs text-zinc-400 mt-1 font-medium">
                    <span className="flex items-center gap-1"><ArrowUp size={12} className="text-aura-tertiary"/> {char.follower_count.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Zap size={12} className="text-aura-primary"/> Lv.{char.fan_level}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Daily Batch</span>
                  <div className="flex gap-1">
                    {[1,2,3,4].map(idx => (
                      <div key={idx} className={`w-3 h-3 rounded-full ${idx <= 2 ? 'bg-green-500' : 'bg-zinc-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
