-- Optional: metadata table for AI character generation
create table if not exists public.character_generations (
  id bigserial primary key,
  request_id text unique not null,
  manager_user_id uuid not null,
  storage_bucket text not null,
  storage_path text not null,
  character_name text not null,
  source_model text not null,
  created_at timestamptz not null default now()
);

create index if not exists character_generations_manager_user_id_idx
  on public.character_generations (manager_user_id);

-- Required: storage bucket for generated payloads
insert into storage.buckets (id, name, public)
values ('character-generations', 'character-generations', false)
on conflict (id) do nothing;
