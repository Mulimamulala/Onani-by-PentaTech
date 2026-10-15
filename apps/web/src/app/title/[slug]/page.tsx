import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { episodeLabel, formatDuration } from '@onani/core'
import { getTitleBySlug } from '@/lib/catalog'

export async function generateMetadata({ params }: PageProps<'/title/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const title = await getTitleBySlug(slug)
  if (!title) return {}
  return {
    title: title.name,
    description: title.synopsis ?? undefined,
    openGraph: {
      title: title.name,
      description: title.synopsis ?? undefined,
      images: title.backdrop_url ?? title.poster_url ?? undefined,
    },
  }
}

export default function TitlePage({ params }: PageProps<'/title/[slug]'>) {
  return (
    <Suspense fallback={<div className="h-[60vh] animate-pulse bg-surface" />}>
      <TitleDetails params={params} />
    </Suspense>
  )
}

async function TitleDetails({ params }: { params: PageProps<'/title/[slug]'>['params'] }) {
  const { slug } = await params
  const title = await getTitleBySlug(slug)
  if (!title) notFound()

  const videos = title.videos
  const first = videos[0]

  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden">
        {title.backdrop_url && (
          <Image src={title.backdrop_url} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-30" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-10 pt-16 sm:flex-row sm:px-8">
          {title.poster_url && (
            <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg ring-1 ring-border sm:w-56">
              <Image src={title.poster_url} alt={title.name} fill sizes="224px" className="object-cover" />
            </div>
          )}
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold sm:text-5xl">{title.name}</h1>
            <p className="mt-3 flex flex-wrap gap-x-3 text-sm text-muted">
              {title.release_year && <span>{title.release_year}</span>}
              {title.maturity_rating && <span className="rounded border border-border px-1">{title.maturity_rating}</span>}
              <span>{title.kind === 'series' ? `${videos.length} episodes` : formatDuration(first?.duration_seconds)}</span>
              {title.genres.length > 0 && <span>{title.genres.join(', ')}</span>}
              {title.is_free && <span className="font-semibold text-accent">Free to watch</span>}
            </p>
            {title.synopsis && <p className="mt-4 leading-relaxed">{title.synopsis}</p>}
            {first ? (
              <Link
                href={`/watch/${first.id}`}
                className="mt-6 inline-block rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90"
              >
                ▶ {title.kind === 'series' ? `Play ${episodeLabel(first.season_number, first.episode_number)}` : 'Play'}
              </Link>
            ) : (
              <p className="mt-6 text-sm text-muted">Coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {title.kind === 'series' && videos.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-8">
          <h2 className="mb-4 text-lg font-semibold">Episodes</h2>
          <ol className="divide-y divide-border rounded-lg border border-border">
            {videos.map((v) => (
              <li key={v.id}>
                <Link href={`/watch/${v.id}`} className="flex gap-4 p-4 hover:bg-surface">
                  <span className="w-16 shrink-0 text-sm text-muted">{episodeLabel(v.season_number, v.episode_number)}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{v.name}</span>
                    {v.synopsis && <span className="mt-1 block text-sm text-muted">{v.synopsis}</span>}
                  </span>
                  <span className="text-sm text-muted">{formatDuration(v.duration_seconds)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
