-- The frame used for a video's artwork and the start of its teaser,
-- chosen automatically when Mux finishes processing (the most detailed of
-- several sampled frames, so black transitions and fades are skipped).
alter table public.videos add column cover_time_seconds numeric check (cover_time_seconds >= 0);
