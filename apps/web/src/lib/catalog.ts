import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { frameTime, signedThumbnailUrl } from '@/lib/mux'
import { createPublicClient } from '@/lib/supabase/server'

// Public catalog reads. Cached on the server and refreshed via the 'catalog'
// tag whenever an admin edits titles or Mux finishes processing a video.
export const CATALOG_TAG = 'catalog'

const TITLE_FIELDS =
  'id, slug, kind, name, synopsis, poster_url, backdrop_url, release_year, maturity_rating, genres, is_free, is_featured, published_at'

// A title's first ready video doubles as its artwork until a poster is uploaded.
// Thumbnail tokens last two days; cached entries expire well before that.
async function frameFor(video: { mux_playback_id: string | null; duration_seconds: number | null } | undefined, width?: number) {
  if (!video?.mux_playback_id) return null
  return signedThumbnailUrl(video.mux_playback_id, { width, time: frameTime(video.duration_seconds) })
}

/** Every published title, newest first, with a frame_url for artwork. */
export async function getAllTitles() {
  'use cache'
  cacheTag(CATALOG_TAG)
  cacheLife('minutes')

  const { data, error } = await createPublicClient()
    .from('titles')
    .select(`${TITLE_FIELDS}, videos (mux_playback_id, duration_seconds)`)
    .order('published_at', { ascending: false })
    .order('season_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .limit(1, { referencedTable: 'videos' })
    .limit(500)
  if (error) throw error

  return Promise.all(
    (data ?? []).map(async ({ videos, ...title }) => ({ ...title, frame_url: await frameFor(videos[0]) })),
  )
}

export async function getHomeCatalog() {
  const titles = await getAllTitles()
  const featured = titles.filter((t) => t.is_featured)
  const hero = featured[0] ?? titles[0] ?? null

  return {
    hero,
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
      `${TITLE_FIELDS}, videos (id, name, synopsis, season_number, episode_number, duration_seconds, mux_playback_id)`,
    )
    .eq('slug', slug)
    .order('season_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const videos = await Promise.all(
    data.videos.map(async ({ mux_playback_id, ...v }) => ({
      ...v,
      frame_url: await frameFor({ mux_playback_id, duration_seconds: v.duration_seconds }, 640),
    })),
  )
  const frame_url = await frameFor(data.videos[0])
  return { ...data, videos, frame_url }
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
