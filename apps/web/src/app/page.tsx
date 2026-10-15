import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { progressFraction } from '@onani/core'
import { TitleRow } from '@/components/title-card'
import { getCurrentUser } from '@/lib/auth'
import { getHomeCatalog } from '@/lib/catalog'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const { featured, latest, free, genres } = await getHomeCatalog()

  return (
    <div className="space-y-10 pb-16">
      {featured ? (
        <section className="relative isolate overflow-hidden">
          {featured.backdrop_url && (
            <Image src={featured.backdrop_url} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-8 sm:pt-36">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Featured</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-bold sm:text-6xl">{featured.name}</h1>
            {featured.synopsis && <p className="mt-4 max-w-xl text-muted">{featured.synopsis}</p>}
            <Link
              href={`/title/${featured.slug}`}
              className="mt-6 inline-block rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90"
            >
              ▶ Watch now
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <h1 className="text-3xl font-bold">Nothing to watch yet</h1>
          <p className="mt-2 text-muted">Publish a title from the admin dashboard to get started.</p>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-10">
        <Suspense fallback={null}>
          <ContinueWatching />
        </Suspense>
        <TitleRow heading="New on Onani" titles={latest} />
        <TitleRow heading="Watch free" titles={free} />
        {genres.map(([genre, titles]) => (
          <TitleRow key={genre} heading={genre} titles={titles} />
        ))}
      </div>
    </div>
  )
}

async function ContinueWatching() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('watch_progress')
    .select('position_seconds, video:videos (id, name, duration_seconds, title:titles (slug, name))')
    .eq('user_id', user.id)
    .eq('completed', false)
    .order('updated_at', { ascending: false })
    .limit(12)

  const items = (data ?? []).filter((row) => row.video)
  if (items.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="px-4 text-lg font-semibold sm:px-8">Continue watching</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 sm:px-8">
        {items.map(({ video, position_seconds }) => (
          <Link
            key={video!.id}
            href={`/watch/${video!.id}`}
            className="w-60 shrink-0 rounded-lg bg-surface p-3 ring-1 ring-border hover:ring-accent"
          >
            <p className="truncate text-sm font-medium">{video!.title?.name}</p>
            <p className="truncate text-xs text-muted">{video!.name}</p>
            <div className="mt-3 h-1 rounded bg-surface-2">
              <div
                className="h-1 rounded bg-accent"
                style={{ width: `${progressFraction(position_seconds, video!.duration_seconds) * 100}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
