create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('parent', 'teacher')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'parent'),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  punch_type text not null check (punch_type in ('in', 'out')),
  punched_at timestamptz not null default now(),
  latitude double precision not null,
  longitude double precision not null,
  location_accuracy_meters double precision,
  selfie_path text not null,
  device_platform text,
  created_at timestamptz not null default now()
);

create index if not exists teacher_attendance_teacher_id_punched_at_idx
  on public.teacher_attendance (teacher_id, punched_at desc);

alter table public.teacher_attendance enable row level security;

drop policy if exists "Teachers can read their own attendance" on public.teacher_attendance;
create policy "Teachers can read their own attendance"
on public.teacher_attendance
for select
using (auth.uid() = teacher_id);

drop policy if exists "Teachers can insert their own attendance" on public.teacher_attendance;
create policy "Teachers can insert their own attendance"
on public.teacher_attendance
for insert
with check (
  auth.uid() = teacher_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'teacher'
  )
);

insert into storage.buckets (id, name, public)
values ('teacher-selfies', 'teacher-selfies', false)
on conflict (id) do nothing;

create or replace function public.is_teacher_selfie_owner(object_name text)
returns boolean
language sql
stable
as $$
  select split_part(object_name, '/', 1) = auth.uid()::text;
$$;

drop policy if exists "Teachers can upload their own selfies" on storage.objects;
create policy "Teachers can upload their own selfies"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'teacher-selfies'
  and public.is_teacher_selfie_owner(name)
);

drop policy if exists "Teachers can read their own selfies" on storage.objects;
create policy "Teachers can read their own selfies"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'teacher-selfies'
  and public.is_teacher_selfie_owner(name)
);
