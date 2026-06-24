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

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  grade_label text,
  homeroom text,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_students (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relation text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create index if not exists parent_students_parent_id_idx
  on public.parent_students (parent_id, is_primary desc);

create or replace function public.parent_has_student(student_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.parent_students
    where parent_students.parent_id = auth.uid()
      and parent_students.student_id = student_uuid
  );
$$;

alter table public.students enable row level security;
alter table public.parent_students enable row level security;

drop policy if exists "Parents can read linked students" on public.students;
create policy "Parents can read linked students"
on public.students
for select
using (public.parent_has_student(id));

drop policy if exists "Parents can read their student links" on public.parent_students;
create policy "Parents can read their student links"
on public.parent_students
for select
using (auth.uid() = parent_id);

create table if not exists public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  attended_on date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  unique (student_id, attended_on)
);

create index if not exists student_attendance_student_id_attended_on_idx
  on public.student_attendance (student_id, attended_on desc);

alter table public.student_attendance enable row level security;

drop policy if exists "Parents can read linked student attendance" on public.student_attendance;
create policy "Parents can read linked student attendance"
on public.student_attendance
for select
using (public.parent_has_student(student_id));

create table if not exists public.student_timetable (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  weekday integer not null check (weekday between 1 and 5),
  title text not null,
  room text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create index if not exists student_timetable_student_id_weekday_start_idx
  on public.student_timetable (student_id, weekday, start_time);

alter table public.student_timetable enable row level security;

drop policy if exists "Parents can read linked student timetable" on public.student_timetable;
create policy "Parents can read linked student timetable"
on public.student_timetable
for select
using (public.parent_has_student(student_id));

create table if not exists public.student_pickup_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  pickup_date date not null default current_date,
  pickup_time time not null,
  gate text not null,
  contact_name text not null,
  contact_relation text not null,
  created_at timestamptz not null default now()
);

create index if not exists student_pickup_plans_student_id_pickup_date_idx
  on public.student_pickup_plans (student_id, pickup_date desc);

alter table public.student_pickup_plans enable row level security;

drop policy if exists "Parents can read linked student pickup plans" on public.student_pickup_plans;
create policy "Parents can read linked student pickup plans"
on public.student_pickup_plans
for select
using (public.parent_has_student(student_id));

create table if not exists public.parent_alerts (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  body text not null,
  tone text not null default 'default' check (tone in ('default', 'accent')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (parent_id is not null or student_id is not null)
);

create index if not exists parent_alerts_parent_id_published_at_idx
  on public.parent_alerts (parent_id, published_at desc);

create index if not exists parent_alerts_student_id_published_at_idx
  on public.parent_alerts (student_id, published_at desc);

alter table public.parent_alerts enable row level security;

drop policy if exists "Parents can read relevant alerts" on public.parent_alerts;
create policy "Parents can read relevant alerts"
on public.parent_alerts
for select
using (
  auth.uid() = parent_id
  or (student_id is not null and public.parent_has_student(student_id))
);

create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  push_provider text not null default 'fcm' check (push_provider in ('fcm', 'apns')),
  push_token text not null unique,
  timezone text not null default 'UTC',
  locale text,
  notifications_enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, push_token)
);

create index if not exists push_devices_user_id_idx
  on public.push_devices (user_id);

create index if not exists push_devices_enabled_timezone_idx
  on public.push_devices (notifications_enabled, timezone);

alter table public.push_devices enable row level security;

drop policy if exists "Users can read their own push devices" on public.push_devices;
create policy "Users can read their own push devices"
on public.push_devices
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own push devices" on public.push_devices;
create policy "Users can insert their own push devices"
on public.push_devices
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own push devices" on public.push_devices;
create policy "Users can update their own push devices"
on public.push_devices
for update
using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_devices_set_updated_at on public.push_devices;
create trigger push_devices_set_updated_at
before update on public.push_devices
for each row execute procedure public.touch_updated_at();

create table if not exists public.notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  audience_role text check (audience_role in ('parent', 'teacher')),
  send_strategy text not null check (send_strategy in ('once', 'daily')),
  scheduled_time time not null,
  scheduled_date date,
  timezone_mode text not null default 'user_local' check (timezone_mode in ('user_local', 'fixed')),
  fixed_timezone text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (send_strategy = 'daily' and scheduled_date is null)
    or (send_strategy = 'once' and scheduled_date is not null)
  ),
  check (
    (timezone_mode = 'user_local' and fixed_timezone is null)
    or (timezone_mode = 'fixed' and fixed_timezone is not null)
  )
);

create index if not exists notification_campaigns_active_idx
  on public.notification_campaigns (is_active, send_strategy, scheduled_time);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.notification_campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  push_device_id uuid references public.push_devices(id) on delete set null,
  provider_message_id text,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id, scheduled_for)
);

create index if not exists notification_deliveries_status_scheduled_for_idx
  on public.notification_deliveries (status, scheduled_for);

alter table public.notification_campaigns enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "Users can read their own notification deliveries" on public.notification_deliveries;
create policy "Users can read their own notification deliveries"
on public.notification_deliveries
for select
using (auth.uid() = user_id);
