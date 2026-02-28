import { getMockPosts, getMockCharacters } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default async function FeedPage() {
  const posts = await getMockPosts(5, 0);
  const chars = await getMockCharacters(10, 0);
  
  // Map char data simply for feed
  const charMap = new Map(chars.map(c => [c.id, c]));

  return (
    <main className="flex flex-col w-full h-[calc(100vh-64px)] bg-aura-surface snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scrollbar-hide relative pb-16">
      <div className="absolute top-0 w-full z-20 flex px-4">
        {/* Top Navigation Tabs */}
        <div className="flex gap-4 items-center flex-1 mt-[16px] overflow-x-auto scrollbar-hide">
          <button className="h-12 border-b-2 border-aura-primary font-bold text-white whitespace-nowrap px-1">추천</button>
          <button className="h-12 border-b-2 border-transparent font-medium text-zinc-400 whitespace-nowrap px-1">팔로우</button>
          <button className="h-12 border-b-2 border-transparent font-medium text-zinc-400 whitespace-nowrap px-1">내 캐릭터</button>
        </div>
      </div>

      {posts.map((post) => {
        const char = charMap.get(post.character_id);
        const isVideo = post.content_type === "moving_poster";
        return (
          <div key={post.id} className="relative w-full h-[100dvh] snap-start snap-always bg-aura-surface shrink-0">
            {isVideo ? (
              <video src={post.media_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
            ) : (
              <Image src={post.media_url || post.media_thumb_url || "/default-avatar.png"} alt={post.caption} fill className="object-cover opacity-90" />
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/60 to-transparent pointer-events-none" />

            {/* Right Action Bar - 56dp width zone */}
            <div className="absolute right-0 bottom-[calc(24px+4rem)] w-[56px] flex flex-col gap-4 items-center z-10 mr-2">
              <Link href={`/character/${post.character_id}`}>
                <div className="w-12 h-12 rounded-full border-2 border-aura-primary overflow-hidden relative shadow-lg shadow-aura-primary/20 mb-2">
                  <Image src={char?.avatar_url || "/default-avatar.png"} alt={char?.name || "Char"} fill className="object-cover" />
                </div>
              </Link>
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 flex items-center justify-center bg-transparent text-white cursor-pointer hover:bg-white/10 rounded-full transition-colors">
                  <Heart size={24} className="text-white group-hover:text-aura-primary transition-colors" />
                </div>
                <span className="text-xs font-semibold text-white">{post.like_count}</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 flex items-center justify-center bg-transparent text-white cursor-pointer hover:bg-white/10 rounded-full transition-colors">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-semibold text-white">{Math.floor(post.like_count / 10)}</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 flex items-center justify-center bg-transparent text-white cursor-pointer hover:bg-white/10 rounded-full transition-colors">
                  <Share2 size={24} />
                </div>
                <span className="text-xs font-semibold text-white">{post.share_count}</span>
              </div>
            </div>

            {/* Bottom Info Container (padding 16dp) */}
            <div className="absolute left-0 bottom-[calc(24px+4rem)] right-[72px] p-4 text-white z-10 flex flex-col justify-end">
              <Link href={`/character/${post.character_id}`}>
                <h2 className="text-[16px] font-bold flex items-center gap-2 hover:text-aura-primary transition-colors drop-shadow-md">
                  {char?.name || "Unknown"}
                  <span className="text-[10px] border border-aura-tertiary text-aura-tertiary px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">{post.activity_mode}</span>
                </h2>
              </Link>
              <p className="text-[14px] mt-2 line-clamp-2 opacity-90 leading-relaxed drop-shadow-md">
                {post.caption}
              </p>
            </div>
            
          </div>
        );
      })}
    </main>
  );
}
