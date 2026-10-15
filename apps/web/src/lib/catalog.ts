import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'

// Public catalog reads. Cached on the server and refreshed via the 'catalog'
// tag whenever an admin edits titles or Mux finishes processing a video.
export const CATALOG_TAG = 'catalog'

const TITLE_FIELDS =
  'id, slug, kind, name, synopsis, poster_url, backdrop_url, release_year, maturity_rating, genres, is_free, is_featured, published_at'

export async function getHomeCatalog() {
  'use cache'
  cacheTag(CATALOG_TAG)
  cacheLife('minutes')

  const { data, error } = await createPublicClient()
    .from('titles')
    .select(TITLE_FIELDS)
    .order('published_at', { ascending: false })
    .limit(100)
  if (error) throw error

  const titles = data ?? []
  const featured = titles.find((t) => t.is_featured) ?? titles[0] ?? null

  const byGenre = new Map<string, typeof titles>()
  for (const t of titles) {
    for (const g of t.genres) {
      byGenre.set(g, [...(byGenre.get(g) ?? []), t])
    }
  }

  return {
    featured,
    latest: titles.slice(0, 20),
    free: titles.filter((t) => t.is_free),
    genres: [...byGenre.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6),
  }
}

export async function getTitleBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAG, `title:${slug}`)
  cacheLife('minutes')

  const { data, error } = await createPublicClient()
    .from('titles')
    .select(
      `${TITLE_FIELDS}, videos (id, name, synopsis, season_number, episode_number, duration_seconds)`,
    )
    .eq('slug', slug)
    .order('season_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', ascending: true, nullsFirst: true })
    .maybeSingle()
  if (error) throw error
  return data
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
