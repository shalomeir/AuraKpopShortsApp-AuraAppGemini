import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Zap,
  ArrowUp,
  History,
  ExternalLink,
} from "lucide-react";
import { ManageToneSettings } from "./tone-settings";
import { ManageAiActions } from "./ai-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDevBypassUserId } from "@/lib/server/dev-auth";
import { redirect } from "next/navigation";

interface ManagedCharacterDetail {
  id: string;
  name: string;
  concept: string | null;
  comment_tone: string | null;
  avatar_url: string | null;
  fan_level: number;
  follower_count: number;
  memory: {
    milestones?: string[];
  } | null;
}

interface BatchQueueItem {
  sequence: number;
  scheduled_at: string;
  status: string;
}

/**
 * Manage Character Detail Page
 * Loads character data from Supabase and displays management dashboard.
 */
export default async function ManageCharacterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fallbackUserId = getDevBypassUserId();
  const userId = user?.id ?? fallbackUserId;

  if (!userId) {
    redirect("/login");
  }

  const { data: charData } = await supabase
    .from("characters")
    .select("id, name, concept, comment_tone, avatar_url, fan_level, follower_count, memory")
    .eq("id", params.id)
    .eq("owner_id", userId)
    .single();

  if (!charData) {
    redirect("/manage");
  }

  const char = charData as ManagedCharacterDetail;

  const { data: queueData } = await supabase
    .from("batch_queue")
    .select("sequence, scheduled_at, status")
    .eq("character_id", params.id)
    .order("sequence", { ascending: true })
    .limit(4);

  const batches = ((queueData ?? []) as BatchQueueItem[]).map((item) => {
    const date = new Date(item.scheduled_at);
    const time = date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const normalizedStatus =
      item.status === "done" || item.status === "processing"
        ? item.status
        : "pending";

    return {
      seq: item.sequence,
      time,
      status: normalizedStatus,
    };
  });
  const displayBatches =
    batches.length > 0
      ? batches
      : [
          { seq: 1, time: "--:--", status: "pending" },
          { seq: 2, time: "--:--", status: "pending" },
          { seq: 3, time: "--:--", status: "pending" },
          { seq: 4, time: "--:--", status: "pending" },
        ];

  const milestones = (char.memory?.milestones ?? []).slice(-3).reverse().map((event, index) => ({
    date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
    event,
  }));

  // Derived stats from character data
  const totalViews = char.follower_count * 58;
  const totalLikes = char.follower_count * 8;

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
            <Image
              src={char.avatar_url || "/default-avatar.svg"}
              alt={char.name}
              fill
              className="object-cover"
            />
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
            <div className="text-xs text-zinc-500 font-bold uppercase mt-1">
              Fan Level
            </div>
          </div>
          <div className="bg-aura-surfaceContainer border border-aura-outline p-4 rounded-xl flex flex-col items-center">
            <ArrowUp className="text-aura-tertiary mb-2" size={24} />
            <div className="text-2xl font-black">
              {char.follower_count.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 font-bold uppercase mt-1">
              Followers
            </div>
          </div>
          <div className="bg-aura-surfaceContainer border border-aura-outline p-4 rounded-xl flex flex-col items-center col-span-2">
            <div className="flex w-full justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Total Views</span>
              <span className="font-bold text-white">
                {totalViews.toLocaleString()}
              </span>
            </div>
            <hr className="w-full border-aura-outline my-2" />
            <div className="flex w-full justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Total Likes</span>
              <span className="font-bold text-white">
                {totalLikes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Batches */}
        <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="font-bold text-lg text-white flex justify-between items-center">
            <span>Today&apos;s Batch</span>
            <span className="text-xs text-zinc-400 bg-black/50 px-2 py-1 rounded-md border border-aura-outline">
              4 Posts / Day
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-2 mt-2 relative before:absolute before:inset-y-[10px] before:inset-x-[12%] before:border-t-2 before:border-aura-outline before:z-0">
            {displayBatches.map((v) => (
              <div
                key={v.seq}
                className="flex flex-col items-center z-10 gap-2"
              >
                <div
                  className={`w-6 h-6 rounded-full flex justify-center items-center font-bold text-[10px] border-2 shadow-lg
                     ${
                       v.status === "done"
                         ? "bg-green-500 border-green-400 text-black shadow-green-500/30"
                         : v.status === "processing"
                           ? "bg-aura-primary border-aura-tertiary text-black animate-pulse shadow-aura-primary/30"
                           : "bg-aura-surface border-zinc-500 text-zinc-500"
                     }`}
                >
                  {v.seq}
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {v.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tone Settings (client component for interactivity) */}
        <ManageToneSettings initialTone={char.comment_tone || "friendly"} />

        {/* LLM Actions (client component for API execution) */}
        <ManageAiActions characterId={char.id} />

        {/* Memory Milestones */}
        <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <History size={18} className="text-zinc-400" />
            Memory Timeline
          </h3>
          <div className="flex flex-col gap-4 mt-2 pl-2 border-l-2 border-aura-primary/40 ml-2">
            {(milestones.length > 0
              ? milestones
              : [{ date: new Date().toISOString().slice(0, 10), event: "No milestones recorded yet." }]).map((m, i) => (
              <div key={i} className="relative pl-4 flex flex-col gap-1">
                <div className="absolute left-[-17px] top-1 w-3 h-3 bg-aura-primary rounded-full border-2 border-aura-surface ring-[2px] ring-aura-primary/50" />
                <span className="text-[10px] text-aura-tertiary font-bold tracking-widest uppercase">
                  {m.date}
                </span>
                <span className="text-sm text-zinc-300 font-medium leading-tight">
                  {m.event}
                </span>
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
