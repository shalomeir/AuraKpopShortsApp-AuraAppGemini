create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  gender text,
  age_range text,
  nationality text,
  face_shape text,
  hair_color text,
  fashion_mood text,
  concept text,
  position text[] default '{}'::text[],
  signature_mood text,
  persona text,
  comment_tone text default 'friendly',
  activity_modes text[] default array['performance', 'daily', 'meme', 'fan'],
  memory jsonb not null default '{
    "debut_story": null,
    "milestones": [],
    "last_event": null,
    "post_count": 0
  }'::jsonb,
  fan_level integer not null default 0,
  follower_count integer not null default 0,
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_characters_owner_id on public.characters(owner_id);
create index if not exists idx_characters_fan_level on public.characters(fan_level desc);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  content_type text not null,
  caption text,
  media_url text,
  media_thumb_url text,
  activity_mode text,
  batch_sequence integer,
  generation_meta jsonb not null default '{}'::jsonb,
  like_count integer not null default 0,
  view_count integer not null default 0,
  share_count integer not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_character_id on public.posts(character_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_status on public.posts(status);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, character_id)
);

create index if not exists idx_follows_character_id on public.follows(character_id);

create table if not exists public.batch_queue (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  scheduled_at timestamptz not null,
  sequence integer not null check (sequence between 1 and 4),
  status text not null default 'pending',
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_batch_queue_schedule_status
  on public.batch_queue(scheduled_at, status);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_characters_updated_at on public.characters;
create trigger set_characters_updated_at
before update on public.characters
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.post_likes enable row level security;
alter table public.batch_queue enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_self_write" on public.profiles;
create policy "profiles_self_write" on public.profiles
for all using (auth.uid() = id);

drop policy if exists "characters_public_read" on public.characters;
create policy "characters_public_read" on public.characters
for select using (true);

drop policy if exists "characters_owner_write" on public.characters;
create policy "characters_owner_write" on public.characters
for all using (auth.uid() = owner_id);

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
for select using (status = 'published');

drop policy if exists "follows_own" on public.follows;
create policy "follows_own" on public.follows
for all using (auth.uid() = follower_id);

drop policy if exists "likes_own" on public.post_likes;
create policy "likes_own" on public.post_likes
for all using (auth.uid() = user_id);

drop policy if exists "batch_queue_owner_read" on public.batch_queue;
create policy "batch_queue_owner_read" on public.batch_queue
for select using (
  exists (
    select 1
    from public.characters c
    where c.id = batch_queue.character_id
      and c.owner_id = auth.uid()
  )
);

