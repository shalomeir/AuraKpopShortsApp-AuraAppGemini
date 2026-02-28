import { getMockCharacters, getMockPosts } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Grid, Sparkles, MoreHorizontal } from "lucide-react";

export default async function CharacterProfilePage({ params }: { params: { id: string } }) {
  const chars = await getMockCharacters(20, 0);
  const char = chars.find(c => c.id === params.id) || chars[0]; // fallback
  
  // mock their posts by filtering
  const allPosts = await getMockPosts(30, 0);
  const charPosts = allPosts.filter(p => p.character_id === char.id).slice(0, 9);
  
  // if no posts, just reuse allPosts to mock heavily
  const postsToShow = charPosts.length > 0 ? charPosts : allPosts.slice(0, 9);

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Top Banner & Header (240dp height) */}
      <div className="relative h-[240px] w-full shrink-0 bg-aura-surfaceContainer">
        <Image src={char.avatar_url || "/default-avatar.png"} alt="Cover" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14]/60 to-[#0B0F14] opacity-100" />
        
        <div className="absolute top-0 w-full p-4 pt-[16px] flex justify-between items-center z-10">
          <Link href="/">
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </div>
          </Link>
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
            <MoreHorizontal size={24} />
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-4 flex items-end gap-4">
          <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden shrink-0 border-[2px] border-aura-surface bg-aura-surfaceVariant elevation-2">
            <Image src={char.avatar_url || "/default-avatar.png"} alt={char.name} fill className="object-cover" />
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
              {char.name}
              <Sparkles size={16} className="text-aura-tertiary" />
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{char.concept} · {char.position.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex justify-around bg-aura-surfaceVariant/50 py-3 rounded-[16px] mb-4">
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-white">{char.follower_count.toLocaleString()}</span>
            <span className="text-xs text-zinc-400 mt-1">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-aura-primary drop-shadow-[0_0_4px_rgba(255,47,146,0.6)]">Lv.{char.fan_level}</span>
            <span className="text-xs text-zinc-400 mt-1">Fan Level</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-white">{postsToShow.length+12}</span>
            <span className="text-xs text-zinc-400 mt-1">Posts</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 font-bold text-white transition-all active:scale-[0.98] outline-none h-12 rounded-full border-[1.5px] border-aura-primary hover:bg-aura-primary/10 flex items-center justify-center">
            Follow
          </button>
        </div>
        
        <p className="mt-4 text-[14px] text-zinc-300 leading-relaxed px-1">
          <span className="font-semibold text-aura-tertiary block mb-1 text-[12px]">ABOUT</span>
          &quot;{char.memory.debut_story || 'Working hard to debut and meet you all soon!'}&quot;
        </p>
      </div>

      {/* Posts Grid Layout */}
      <div className="mt-2 text-white border-t border-aura-outline">
        <div className="flex py-3 px-4">
          <Grid size={24} className="text-white" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {postsToShow.map((post) => (
            <div key={post.id} className="relative aspect-[3/4] bg-aura-surfaceVariant overflow-hidden cursor-pointer group">
              <Image src={post.media_thumb_url || post.media_url || "/default-avatar.png"} alt="post" fill className="object-cover" />
              {post.content_type === "moving_poster" && (
                <div className="absolute top-1 right-1 bg-black/50 px-1 py-0.5 rounded backdrop-blur-sm">
                  <span className="text-[9px] font-bold text-white tracking-wider">FILM</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
