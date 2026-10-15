-- Onani: initial schema
-- Catalog (titles + videos), plans, subscriptions, profiles, watch progress.
-- Admins are users whose app_metadata.role = 'admin' (set server-side only; never user_metadata).

create schema if not exists private;

-- ─── Helpers ────────────────────────────────────────────────────────────────

create or replace function private.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant usage on schema private to authenticated, anon;
grant execute on function private.is_admin() to authenticated, anon;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Enums ──────────────────────────────────────────────────────────────────

create type public.title_kind as enum ('movie', 'series');
create type public.video_status as enum ('waiting_upload', 'processing', 'ready', 'errored');
create type public.subscription_status as enum ('pending', 'active', 'cancelled', 'expired');

-- ─── Profiles ───────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- Create a profile row for each new auth user.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "Users can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ─── Titles (a movie or a series) ───────────────────────────────────────────

create table public.titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind public.title_kind not null default 'movie',
  name text not null,
  synopsis text,
  poster_url text,
  backdrop_url text,
  release_year int check (release_year between 1900 and 2100),
  maturity_rating text,
  genres text[] not null default '{}',
  is_free boolean not null default false,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index titles_published_at_idx on public.titles (published_at desc) where published_at is not null;
create index titles_genres_idx on public.titles using gin (genres);

create trigger titles_updated_at before update on public.titles
  for each row execute function private.set_updated_at();

alter table public.titles enable row level security;

create policy "Anyone can read published titles" on public.titles
  for select to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy "Admins can read all titles" on public.titles
  for select to authenticated using ((select private.is_admin()));

create policy "Admins can insert titles" on public.titles
  for insert to authenticated with check ((select private.is_admin()));

create policy "Admins can update titles" on public.titles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete titles" on public.titles
  for delete to authenticated using ((select private.is_admin()));

-- ─── Videos (a movie's single video, or a series episode) ───────────────────
-- Mux assets use a *signed* playback policy, so a playback ID alone cannot be
-- streamed; the app issues short-lived tokens after checking entitlement.

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles (id) on delete cascade,
  season_number int check (season_number > 0),
  episode_number int check (episode_number > 0),
  name text not null,
  synopsis text,
  duration_seconds numeric,
  status public.video_status not null default 'waiting_upload',
  mux_upload_id text unique,
  mux_asset_id text unique,
  mux_playback_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_id, season_number, episode_number)
);

create index videos_title_id_idx on public.videos (title_id);

create trigger videos_updated_at before update on public.videos
  for each row execute function private.set_updated_at();

alter table public.videos enable row level security;

create policy "Anyone can read ready videos of published titles" on public.videos
  for select to anon, authenticated
  using (
    status = 'ready'
    and exists (
      select 1 from public.titles t
      where t.id = videos.title_id
        and t.published_at is not null
        and t.published_at <= now()
    )
  );

create policy "Admins can read all videos" on public.videos
  for select to authenticated using ((select private.is_admin()));

create policy "Admins can insert videos" on public.videos
  for insert to authenticated with check ((select private.is_admin()));

create policy "Admins can update videos" on public.videos
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete videos" on public.videos
  for delete to authenticated using ((select private.is_admin()));

-- ─── Plans ──────────────────────────────────────────────────────────────────
-- Prices are stored in ngwee (1 ZMW = 100 ngwee) to avoid floating-point money.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_minor int not null check (price_minor >= 0),
  currency text not null default 'ZMW',
  period_days int not null check (period_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "Anyone can read active plans" on public.plans
  for select to anon, authenticated using (is_active);

create policy "Admins can read all plans" on public.plans
  for select to authenticated using ((select private.is_admin()));

create policy "Admins can manage plans" on public.plans
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ─── Subscriptions ──────────────────────────────────────────────────────────
-- Written only by the server (payment webhooks, using the secret key), never by clients.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status public.subscription_status not null default 'pending',
  provider text not null,
  provider_reference text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function private.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscriptions" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Admins can read all subscriptions" on public.subscriptions
  for select to authenticated using ((select private.is_admin()));

-- ─── Watch progress ("continue watching") ───────────────────────────────────

create table public.watch_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  position_seconds numeric not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index watch_progress_user_recent_idx on public.watch_progress (user_id, updated_at desc);
create index watch_progress_video_id_idx on public.watch_progress (video_id);

create trigger watch_progress_updated_at before update on public.watch_progress
  for each row execute function private.set_updated_at();

alter table public.watch_progress enable row level security;

create policy "Users can read their own progress" on public.watch_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress" on public.watch_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress" on public.watch_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own progress" on public.watch_progress
  for delete to authenticated using ((select auth.uid()) = user_id);
