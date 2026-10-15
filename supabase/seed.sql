-- Local development seed data. Runs on `supabase db reset`.


-- Sample titles (no videos yet: upload them from /admin once Mux is configured).
insert into public.titles (slug, kind, name, synopsis, release_year, genres, is_free, is_featured, published_at) values
  ('welcome-to-onani', 'movie', 'Welcome to Onani', 'A short introduction to Onani by PentaTech.', 2026, '{Documentary}', true, true, now()),
  ('lusaka-nights', 'series', 'Lusaka Nights', 'Placeholder series for layout testing.', 2026, '{Drama}', false, false, now());
