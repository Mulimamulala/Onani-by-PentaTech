import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { frameTime, signPreview, signedThumbnailUrl } from '@/lib/mux'
import { createPublicClient } from '@/lib/supabase/server'

// Public catalog reads. Cached on the server and refreshed via the 'catalog'
// tag whenever an admin edits titles or Mux finishes processing a video.
export const CATALOG_TAG = 'catalog'

const TITLE_FIELDS =
  'id, slug, kind, name, synopsis, poster_url, backdrop_url, release_year, maturity_rating, genres, is_free, is_featured, published_at'

// A title's first ready video doubles as its artwork until a poster is uploaded.
// Thumbnail tokens last two days; cached entries expire well before that.
type FrameSource = { mux_playback_id: string | null; duration_seconds: number | null; cover_time_seconds?: number | null }

async function frameFor(video: FrameSource | undefined, width?: number) {
  if (!video?.mux_playback_id) return null
  return signedThumbnailUrl(video.mux_playback_id, {
    width,
    time: video.cover_time_seconds ?? frameTime(video.duration_seconds),
  })
}

/** Every published title, newest first, with a frame_url for artwork. */
export async function getAllTitles() {
  'use cache'
  cacheTag(CATALOG_TAG)
  cacheLife('minutes')

  const { data, error } = await createPublicClient()
    .from('titles')
    .select(`${TITLE_FIELDS}, videos (mux_playback_id, duration_seconds, cover_time_seconds)`)
    .order('published_at', { ascending: false })
    .order('season_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .limit(1, { referencedTable: 'videos' })
    .limit(500)
  if (error) throw error

  return Promise.all(
    (data ?? []).map(async ({ videos, ...title }) => ({
      ...title,
      frame_url: await frameFor(videos[0]),
      // Kept for previews; a signed playback ID alone cannot stream anything.
      first_video: videos[0]?.mux_playback_id ? videos[0] : null,
    })),
  )
}

/** Up to five hero slides: featured titles first, then the newest with artwork, each with a sealed 15s teaser. */
export async function getHeroSlides() {
  'use cache'
  cacheTag(CATALOG_TAG)
  cacheLife('minutes')

  const titles = await getAllTitles()
  const ranked = [
    ...titles.filter((t) => t.is_featured),
    ...titles.filter((t) => !t.is_featured && (t.backdrop_url || t.frame_url || t.poster_url)),
  ].slice(0, 5)

  return Promise.all(
    ranked.map(async ({ first_video, ...t }) => ({
      slug: t.slug,
      name: t.name,
      synopsis: t.synopsis,
      kind: t.kind,
      release_year: t.release_year,
      genres: t.genres,
      is_free: t.is_free,
      maturity_rating: t.maturity_rating,
      image: t.backdrop_url ?? t.frame_url ?? t.poster_url,
      preview: first_video?.mux_playback_id
        ? await signPreview(first_video.mux_playback_id, first_video.duration_seconds, first_video.cover_time_seconds)
        : null,
    })),
  )
}

export type HeroSlide = Awaited<ReturnType<typeof getHeroSlides>>[number]

export async function getHomeCatalog() {
  const titles = await getAllTitles()
  return {
    latest: titles.slice(0, 20),
    free: titles.filter((t) => t.is_free),
    films: titles.filter((t) => t.kind === 'movie'),
    series: titles.filter((t) => t.kind === 'series'),
    genres: groupByGenre(titles).slice(0, 6),
    total: titles.length,
  }
}

export function groupByGenre<T extends { genres: string[] }>(titles: T[]): [string, T[]][] {
  const byGenre = new Map<string, T[]>()
  for (const t of titles) {
    for (const g of t.genres) byGenre.set(g, [...(byGenre.get(g) ?? []), t])
  }
  return [...byGenre.entries()].sort((a, b) => b[1].length - a[1].length)
}

export async function getTitleBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAG, `title:${slug}`)
  cacheLife('minutes')

  const { data, error } = await createPublicClient()
    .from('titles')
    .select(
      `${TITLE_FIELDS}, videos (id, name, synopsis, season_number, episode_number, duration_seconds, mux_playback_id, cover_time_seconds)`,
    )
    .eq('slug', slug)
    .order('season_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const videos = await Promise.all(
    data.videos.map(async ({ mux_playback_id, cover_time_seconds, ...v }) => ({
      ...v,
      frame_url: await frameFor({ mux_playback_id, duration_seconds: v.duration_seconds, cover_time_seconds }, 640),
    })),
  )
  const first = data.videos[0]
  const frame_url = await frameFor(first)
  const preview = first?.mux_playback_id
    ? await signPreview(first.mux_playback_id, first.duration_seconds, first.cover_time_seconds)
    : null
  return { ...data, videos, frame_url, preview }
}

export async function getActivePlans() {
  'use cache'
  cacheTag(CATALOG_TAG, 'plans')
  cacheLife('hours')

  const { data, error } = await createPublicClient()
    .from('plans')
    .select('id, code, name, description, price_minor, currency, period_days')
    .order('price_minor')
  if (error) throw error
  return data ?? []
}
