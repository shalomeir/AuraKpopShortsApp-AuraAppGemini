-- Development seed for Aura
-- Safe to rerun: previous seed-tagged rows are removed first.

begin;

-- 1) Ensure profile rows exist for current auth users.
insert into public.profiles (id, username)
select
  u.id,
  case
    when coalesce(u.email, '') = '' then null
    else lower(left(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'), 20)) || '_' || left(u.id::text, 8)
  end
from auth.users u
on conflict (id) do nothing;

-- 2) Clean up previously generated seed rows.
delete from public.posts
where generation_meta->>'seed_tag' = 'aura_dev_seed_v1';

delete from public.characters
where memory->>'seed_tag' = 'aura_dev_seed_v1';

-- 3) Create seed characters from first 3 users.
with seed_users as (
  select id, row_number() over (order by created_at asc) as rn
  from auth.users
  order by created_at asc
  limit 3
),
seed_input as (
  select
    su.id as owner_id,
    case
      when su.rn = 1 then 'AURA NOVA'
      when su.rn = 2 then 'LUMI RIN'
      else 'ECHO YUNA'
    end as name,
    case
      when su.rn = 1 then 'chic'
      when su.rn = 2 then 'cute'
      else 'mysterious'
    end as concept,
    case
      when su.rn = 1 then 'main_vocal'
      when su.rn = 2 then 'main_dancer'
      else 'rapper'
    end as position_name,
    case
      when su.rn = 1 then 'https://picsum.photos/seed/aura_nova_avatar/400/400'
      when su.rn = 2 then 'https://picsum.photos/seed/lumi_rin_avatar/400/400'
      else 'https://picsum.photos/seed/echo_yuna_avatar/400/400'
    end as avatar_url,
    case
      when su.rn = 1 then 36
      when su.rn = 2 then 24
      else 18
    end as fan_level,
    case
      when su.rn = 1 then 12400
      when su.rn = 2 then 7800
      else 5200
    end as follower_count
  from seed_users su
)
insert into public.characters (
  owner_id,
  name,
  gender,
  age_range,
  nationality,
  face_shape,
  hair_color,
  fashion_mood,
  concept,
  position,
  signature_mood,
  persona,
  comment_tone,
  activity_modes,
  memory,
  fan_level,
  follower_count,
  is_active,
  avatar_url
)
select
  s.owner_id,
  s.name,
  'female',
  'twenties',
  'Korea',
  'v-line',
  'black',
  'trendy',
  s.concept,
  array[s.position_name]::text[],
  'bright',
  'artist',
  'friendly',
  array['performance', 'daily', 'meme', 'fan']::text[],
  jsonb_build_object(
    'debut_story', s.name || ' has just debuted on Aura.',
    'milestones', jsonb_build_array('Debut showcase released', 'First fan challenge uploaded'),
    'last_event', 'Debut week campaign completed',
    'post_count', 4,
    'seed_tag', 'aura_dev_seed_v1'
  ),
  s.fan_level,
  s.follower_count,
  true,
  s.avatar_url
from seed_input s;

-- 4) Insert seed posts for each seed character.
with seed_chars as (
  select id, name
  from public.characters
  where memory->>'seed_tag' = 'aura_dev_seed_v1'
),
post_slots as (
  select
    sc.id as character_id,
    sc.name,
    gs as seq
  from seed_chars sc
  cross join generate_series(1, 4) as gs
)
insert into public.posts (
  character_id,
  content_type,
  caption,
  media_url,
  media_thumb_url,
  activity_mode,
  batch_sequence,
  generation_meta,
  like_count,
  view_count,
  share_count,
  status,
  created_at
)
select
  ps.character_id,
  case when ps.seq = 3 then 'moving_poster' else 'image' end,
  ps.name || ' seed content #' || ps.seq,
  case
    when ps.seq = 3 then 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    else 'https://picsum.photos/seed/aura_seed_' || ps.character_id::text || '_' || ps.seq::text || '/1080/1920'
  end,
  'https://picsum.photos/seed/aura_seed_thumb_' || ps.character_id::text || '_' || ps.seq::text || '/360/640',
  case
    when ps.seq = 1 then 'performance'
    when ps.seq = 2 then 'daily'
    when ps.seq = 3 then 'meme'
    else 'fan'
  end,
  ps.seq,
  jsonb_build_object('seed_tag', 'aura_dev_seed_v1', 'source', 'dev_seed_sql'),
  200 * ps.seq,
  1200 * ps.seq,
  30 * ps.seq,
  'published',
  now() - ((5 - ps.seq) * interval '2 hours')
from post_slots ps;

-- 5) Insert initial batch queue rows.
with seed_chars as (
  select id
  from public.characters
  where memory->>'seed_tag' = 'aura_dev_seed_v1'
),
queue_slots as (
  select
    sc.id as character_id,
    gs as seq
  from seed_chars sc
  cross join generate_series(1, 4) as gs
)
insert into public.batch_queue (
  character_id,
  scheduled_at,
  sequence,
  status,
  attempts,
  processed_at
)
select
  qs.character_id,
  now() + (qs.seq * interval '2 hours'),
  qs.seq,
  case when qs.seq <= 2 then 'done' else 'pending' end,
  case when qs.seq <= 2 then 1 else 0 end,
  case when qs.seq <= 2 then now() - ((3 - qs.seq) * interval '1 hours') else null end
from queue_slots qs;

commit;
