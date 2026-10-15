import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { OnaniMark } from '@/components/brand'
import { PosterCard } from '@/components/poster'
import { getAllTitles, groupByGenre } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Browse' }

type Filters = { type?: string; genre?: string; free?: string; q?: string }

export default function BrowsePage({ searchParams }: PageProps<'/browse'>) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-24 md:px-10 md:pt-28">
      <h1 className="text-3xl font-bold tracking-[-0.04em] md:text-5xl">Browse</h1>
      <Suspense fallback={<GridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function Results({ searchParams }: { searchParams: PageProps<'/browse'>['searchParams'] }) {
  const raw = await searchParams
  const f: Filters = {
    type: typeof raw.type === 'string' ? raw.type : undefined,
    genre: typeof raw.genre === 'string' ? raw.genre : undefined,
    free: raw.free === '1' ? '1' : undefined,
    q: typeof raw.q === 'string' ? raw.q.trim() : undefined,
  }

  const all = await getAllTitles()
  const genres = groupByGenre(all).map(([g]) => g)
  const q = f.q?.toLowerCase()

  const titles = all.filter(
    (t) =>
      (!f.type || t.kind === f.type) &&
      (!f.genre || t.genres.includes(f.genre)) &&
      (!f.free || t.is_free) &&
      (!q || t.name.toLowerCase().includes(q) || t.synopsis?.toLowerCase().includes(q)),
  )

  const href = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v)
    const s = params.toString()
    return s ? `/browse?${s}` : '/browse'
  }

  const chips: { label: string; href: string; active: boolean }[] = [
    { label: 'All', href: href({ type: undefined, free: undefined, genre: undefined }), active: !f.type && !f.free && !f.genre },
    { label: 'Films', href: href({ type: f.type === 'movie' ? undefined : 'movie' }), active: f.type === 'movie' },
    { label: 'Series', href: href({ type: f.type === 'series' ? undefined : 'series' }), active: f.type === 'series' },
    { label: 'Free', href: href({ free: f.free ? undefined : '1' }), active: Boolean(f.free) },
    ...genres.map((g) => ({ label: g, href: href({ genre: f.genre === g ? undefined : g }), active: f.genre === g })),
  ]

  return (
    <>
      <form action="/browse" role="search" className="mt-5">
        {f.type && <input type="hidden" name="type" value={f.type} />}
        {f.genre && <input type="hidden" name="genre" value={f.genre} />}
        {f.free && <input type="hidden" name="free" value="1" />}
        <label htmlFor="q" className="sr-only">Search titles</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={f.q}
          placeholder="Search films and series"
          className="w-full rounded-full border border-hairline bg-surface px-5 py-3 text-[15px] outline-none transition placeholder:text-ink-muted focus:border-gold md:max-w-md"
        />
      </form>

      <nav aria-label="Filters" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {chips.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            aria-current={c.active ? 'true' : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              c.active ? 'bg-gold text-gold-ink' : 'bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <p className="mt-6 text-sm text-ink-muted">
        {titles.length} {titles.length === 1 ? 'title' : 'titles'}
        {f.q && <> for “{f.q}”</>}
      </p>

      {titles.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 md:gap-x-4 lg:grid-cols-6 2xl:grid-cols-8">
          {titles.map((t) => (
            <li key={t.slug}>
              <PosterCard title={t} sizes="(min-width: 1024px) 16vw, (min-width: 768px) 20vw, 33vw" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[24px] bg-surface p-10 text-center">
          <OnaniMark className="mx-auto size-8" />
          <p className="mt-3 font-bold">Nothing here yet.</p>
          <p className="mt-1 text-sm text-ink-muted">Try another filter, or check back soon.</p>
        </div>
      )}
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-[14px] bg-surface" />
      ))}
    </div>
  )
}
