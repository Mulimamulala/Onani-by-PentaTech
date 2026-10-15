-- Merge public + admin SELECT policies (one permissive policy per role/action),
-- lock down Supabase's rls_auto_enable() helper, and add the launch plans.

-- titles
drop policy "Anyone can read published titles" on public.titles;
drop policy "Admins can read all titles" on public.titles;
create policy "Read published titles, or all for admins" on public.titles
  for select to anon, authenticated
  using ((published_at is not null and published_at <= now()) or (select private.is_admin()));

-- videos
drop policy "Anyone can read ready videos of published titles" on public.videos;
drop policy "Admins can read all videos" on public.videos;
create policy "Read ready videos of published titles, or all for admins" on public.videos
  for select to anon, authenticated
  using (
    (select private.is_admin())
    or (
      status = 'ready'
      and exists (
        select 1 from public.titles t
        where t.id = videos.title_id
          and t.published_at is not null
          and t.published_at <= now()
      )
    )
  );

-- plans: split "for all" so SELECT has a single policy
drop policy "Anyone can read active plans" on public.plans;
drop policy "Admins can read all plans" on public.plans;
drop policy "Admins can manage plans" on public.plans;
create policy "Read active plans, or all for admins" on public.plans
  for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "Admins can insert plans" on public.plans
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can update plans" on public.plans
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy "Admins can delete plans" on public.plans
  for delete to authenticated using ((select private.is_admin()));

-- subscriptions
drop policy "Users can read their own subscriptions" on public.subscriptions;
drop policy "Admins can read all subscriptions" on public.subscriptions;
create policy "Users read their own subscriptions, admins read all" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_admin()));

-- rls_auto_enable() is created by Supabase for its "auto-enable RLS" event trigger.
-- The trigger runs as its owner, so API roles never need to call it directly.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- Launch plans (prices in ngwee).
insert into public.plans (code, name, description, price_minor, currency, period_days) values
  ('weekly',  'Weekly',  'Full catalog for 7 days',  2500, 'ZMW', 7),
  ('monthly', 'Monthly', 'Full catalog for 30 days', 7500, 'ZMW', 30)
on conflict (code) do nothing;
