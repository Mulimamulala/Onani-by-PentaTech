-- Record of what each user agreed to, and when (Data Protection Act No. 3 of 2021:
-- be able to show when and to what a person consented). Rows are append-only.

create type public.consent_kind as enum ('terms', 'privacy', 'age', 'cookies_analytics');

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.consent_kind not null,
  version text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);

create index consents_user_id_idx on public.consents (user_id, created_at desc);

alter table public.consents enable row level security;

create policy "Users read their own consents, admins read all" on public.consents
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_admin()));

create policy "Users record their own consents" on public.consents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
