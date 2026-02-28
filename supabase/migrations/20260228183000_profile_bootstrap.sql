create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    case
      when coalesce(new.email, '') = '' then null
      else lower(
        left(
          regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'),
          20
        )
      ) || '_' || left(new.id::text, 8)
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();
