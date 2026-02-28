'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

type FeedTab = 'recommended' | 'following' | 'mine';

interface FeedCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  follower_count: number;
  fan_level: number;
}

interface FeedPost {
  id: string;
  character_id: string;
  content_type: string;
  caption: string | null;
  media_url: string | null;
  media_thumb_url: string | null;
  activity_mode: string | null;
  like_count: number;
  share_count: number;
  character: FeedCharacter | FeedCharacter[] | null;
}

interface FeedResponse {
  posts: FeedPost[];
  message?: string;
}

function tabLabel(tab: FeedTab): string {
  if (tab === 'recommended') return 'For You';
  if (tab === 'following') return 'Following';
  return 'My Idols';
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('recommended');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/feed?tab=${activeTab}&limit=20`, {
          method: 'GET',
        });
        const body = (await response.json()) as FeedResponse;

        if (!mounted) return;

        if (!response.ok) {
          if (response.status === 401) {
            setPosts([]);
            setErrorMessage(`${tabLabel(activeTab)} is available after login.`);
            return;
          }

          setPosts([]);
          setErrorMessage(body.message ?? 'An error occurred while loading the feed.');
          return;
        }

        setPosts(body.posts ?? []);
      } catch {
        if (!mounted) return;
        setPosts([]);
        setErrorMessage('A network error occurred.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const tabs = useMemo(
    () => [
      { key: 'recommended' as const, label: 'For You' },
      { key: 'following' as const, label: 'Following' },
      { key: 'mine' as const, label: 'My Idols' },
    ],
    [],
  );

  return (
    <main className="flex flex-col w-full h-[calc(100vh-64px)] bg-aura-surface snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scrollbar-hide relative pb-16">
      <div className="absolute top-0 w-full z-20 flex px-4">
        <div className="flex gap-4 items-center flex-1 mt-[16px] overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-12 border-b-2 whitespace-nowrap px-1 ${
                  isActive
                    ? 'border-aura-primary font-bold text-white'
                    : 'border-transparent font-medium text-zinc-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center text-zinc-400 pt-20">
          Loading feed...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="w-full h-full flex items-center justify-center text-center px-6 text-zinc-300 pt-20">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && posts.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-zinc-400 pt-20">
          No posts available.
        </div>
      ) : null}

      {!isLoading && !errorMessage
        ? posts.map((post) => {
            const characterRaw = post.character;
            const char = Array.isArray(characterRaw)
              ? characterRaw[0]
              : characterRaw;
            const isVideo = post.content_type === 'moving_poster';

            return (
              <div key={post.id} className="relative w-full h-[100dvh] snap-start snap-always bg-aura-surface shrink-0">
                {isVideo ? (
                  <video
                    src={post.media_url ?? ''}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <Image
                    src={post.media_url || post.media_thumb_url || '/default-avatar.svg'}
                    alt={post.caption ?? 'Aura post'}
                    fill
                    className="object-cover opacity-90"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/60 to-transparent pointer-events-none" />

                <div className="absolute right-0 bottom-[calc(24px+4rem)] w-[56px] flex flex-col gap-4 items-center z-10 mr-2">
                  <Link href={`/character/${post.character_id}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-aura-primary overflow-hidden relative shadow-lg shadow-aura-primary/20 mb-2">
                      <Image
                        src={char?.avatar_url || '/default-avatar.svg'}
                        alt={char?.name || 'Char'}
                        fill
                        className="object-cover"
                      />
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

                <div className="absolute left-0 bottom-[calc(24px+4rem)] right-[72px] p-4 text-white z-10 flex flex-col justify-end">
                  <Link href={`/character/${post.character_id}`}>
                    <h2 className="text-[16px] font-bold flex items-center gap-2 hover:text-aura-primary transition-colors drop-shadow-md">
                      {char?.name || 'Unknown'}
                      <span className="text-[10px] border border-aura-tertiary text-aura-tertiary px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                        {post.activity_mode}
                      </span>
                    </h2>
                  </Link>
                  <p className="text-[14px] mt-2 line-clamp-2 opacity-90 leading-relaxed drop-shadow-md">
                    {post.caption ?? ''}
                  </p>
                </div>
              </div>
            );
          })
        : null}
    </main>
  );
}
