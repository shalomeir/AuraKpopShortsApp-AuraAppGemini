'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Zap, ArrowUp, Edit, Save, History, ExternalLink } from "lucide-react";

export default function ManageCharacterDetailPage({ params }: { params: { id: string } }) {
  // Use mock static values for this client component demo
  const [tone, setTone] = useState("friendly");
  const [isEditing, setIsEditing] = useState(false);
  
  const char = {
    id: params.id,
    name: "Yuna",
    concept: "cute",
    follower_count: 15420,
    fan_level: 4,
    avatar_url: "/default-avatar.png",
    total_views: 894300,
    total_likes: 120500,
  };

  const batches = [
    { seq: 1, time: "09:00", status: "done" },
    { seq: 2, time: "12:00", status: "done" },
    { seq: 3, time: "18:00", status: "processing" },
    { seq: 4, time: "22:00", status: "pending" }
  ];

  const milestones = [
    { date: "2025-01-05", event: "Reaches 10k Followers!" },
    { date: "2025-01-03", event: "Generated first viral dance video." },
    { date: "2025-01-01", event: "Debut! Welcome to Aura." }
  ];

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Header */}
      <div className="p-4 pt-4 sticky top-0 z-10 bg-aura-surface/90 backdrop-blur-md flex items-center justify-between border-b border-aura-outline">
        <Link href="/manage">
          <div className="w-10 h-10 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </div>
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          Manage Idol
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 flex flex-col gap-6 text-white pb-20">
        
        {/* Core Info */}
        <div className="flex bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 gap-4 items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-aura-primary">
              <Image src={char.avatar_url} alt={char.name} fill className="object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="font-black text-2xl drop-shadow-sm">{char.name}</h2>
              <span className="text-xs text-aura-tertiary bg-aura-tertiary/10 border border-aura-tertiary/30 w-fit px-2 py-0.5 rounded-full uppercase tracking-wider font-bold mb-2">
                {char.concept}
              </span>
              <Link href={`/character/${char.id}`}>
                 <span className="text-[12px] flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer w-fit">
                    View Public Profile <ExternalLink size={12} />
                 </span>
              </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-aura-surfaceContainer border border-aura-outline p-4 rounded-xl flex flex-col items-center">
              <Zap className="text-aura-primary mb-2" size={24} />
              <div className="text-2xl font-black">{char.fan_level}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase mt-1">Fan Level</div>
           </div>
           <div className="bg-aura-surfaceContainer border border-aura-outline p-4 rounded-xl flex flex-col items-center">
              <ArrowUp className="text-aura-tertiary mb-2" size={24} />
              <div className="text-2xl font-black">{char.follower_count.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase mt-1">Followers</div>
           </div>
           <div className="bg-aura-surfaceContainer border border-aura-outline p-4 rounded-xl flex flex-col items-center col-span-2">
              <div className="flex w-full justify-between items-center text-sm">
                 <span className="text-zinc-400 font-medium">Total Views</span>
                 <span className="font-bold text-white">{char.total_views.toLocaleString()}</span>
              </div>
              <hr className="w-full border-aura-outline my-2" />
              <div className="flex w-full justify-between items-center text-sm">
                 <span className="text-zinc-400 font-medium">Total Likes</span>
                 <span className="font-bold text-white">{char.total_likes.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Batches */}
        <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
           <h3 className="font-bold text-lg text-white flex justify-between items-center">
              <span>Today&apos;s Batch</span>
              <span className="text-xs text-zinc-400 bg-black/50 px-2 py-1 rounded-md border border-aura-outline">4 Posts / Day</span>
           </h3>
           <div className="grid grid-cols-4 gap-2 mt-2 relative before:absolute before:inset-y-[10px] before:inset-x-[12%] before:border-t-2 before:border-aura-outline before:z-0">
             {batches.map(v => (
                <div key={v.seq} className="flex flex-col items-center z-10 gap-2">
                   <div className={`w-6 h-6 rounded-full flex justify-center items-center font-bold text-[10px] border-2 shadow-lg
                     ${v.status === 'done' ? 'bg-green-500 border-green-400 text-black shadow-green-500/30' : 
                       v.status === 'processing' ? 'bg-aura-primary border-aura-tertiary text-black animate-pulse shadow-aura-primary/30' : 
                       'bg-aura-surface border-zinc-500 text-zinc-500'}`}
                   >
                     {v.seq}
                   </div>
                   <span className="text-[10px] text-zinc-400 font-medium">{v.time}</span>
                </div>
             ))}
           </div>
        </div>

        {/* Tone Settings */}
        <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
           <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Content Tone</h3>
              <button onClick={() => setIsEditing(!isEditing)} className="text-aura-secondary hover:text-white transition-colors">
                 {isEditing ? <Save size={18} /> : <Edit size={18} />}
              </button>
           </div>
           <p className="text-xs text-zinc-400 leading-relaxed mb-2">Adjust the LLM generation persona for captions and auto-replies.</p>
           
           <div className="grid grid-cols-2 gap-2">
             {['friendly', 'provocative', 'chic', 'playful'].map(t => (
               <button 
                  key={t}
                  disabled={!isEditing}
                  onClick={() => setTone(t)}
                  className={`py-3 rounded-xl border font-medium transition-colors text-sm capitalize ${tone === t ? 'bg-aura-secondary/20 border-aura-secondary text-aura-secondary' : 'bg-aura-surface border-aura-outline text-zinc-500'} ${!isEditing && 'opacity-60 cursor-not-allowed hidden'}`}
                  style={!isEditing && tone !== t ? { display: 'none' } : {}}
               >
                 {t}
               </button>
             ))}
           </div>
        </div>

        {/* Memory Milestones */}
        <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
           <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <History size={18} className="text-zinc-400"/>
              Memory Timeline
           </h3>
           <div className="flex flex-col gap-4 mt-2 pl-2 border-l-2 border-aura-primary/40 ml-2">
             {milestones.map((m, i) => (
                <div key={i} className="relative pl-4 flex flex-col gap-1">
                   <div className="absolute left-[-17px] top-1 w-3 h-3 bg-aura-primary rounded-full border-2 border-aura-surface ring-[2px] ring-aura-primary/50" />
                   <span className="text-[10px] text-aura-tertiary font-bold tracking-widest uppercase">{m.date}</span>
                   <span className="text-sm text-zinc-300 font-medium leading-tight">{m.event}</span>
                </div>
             ))}
           </div>
           
           <button className="text-xs text-zinc-400 bg-aura-surface border border-aura-outline hover:bg-aura-outline transition-colors py-2 rounded-lg font-bold uppercase mt-4">
              Load More History
           </button>
        </div>

      </div>
    </main>
  );
}
