import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { episodeLabel, formatDuration } from '@onani/core'
import { PentagonField } from '@/components/brand'
import { PlayIcon } from '@/components/icons'
import { Rail } from '@/components/poster'
import { getAllTitles, getTitleBySlug } from '@/lib/catalog'

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
    <Suspense fallback={<div className="h-[70svh] animate-pulse bg-surface" />}>
      <TitleDetails params={params} />
    </Suspense>
  )
}

async function TitleDetails({ params }: { params: PageProps<'/title/[slug]'>['params'] }) {
  const { slug } = await params
  const [title, all] = await Promise.all([getTitleBySlug(slug), getAllTitles()])
  if (!title) notFound()

  const videos = title.videos
  const first = videos[0]
  const image = title.backdrop_url ?? title.poster_url

  const seasons = new Map<number, typeof videos>()
  for (const v of videos) {
    const s = v.season_number ?? 1
    seasons.set(s, [...(seasons.get(s) ?? []), v])
  }

  const related = all
    .filter((t) => t.slug !== title.slug && t.genres.some((g) => title.genres.includes(g)))
    .slice(0, 20)

  const facts = [
    title.release_year,
    title.kind === 'series' ? `${videos.length} episode${videos.length === 1 ? '' : 's'}` : formatDuration(first?.duration_seconds),
    ...title.genres,
  ].filter(Boolean)

  return (
    <div className="space-y-12">
      <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden md:min-h-[78vh]">
        {image ? (
          <Image src={image} alt="" fill fetchPriority="high" sizes="100vw" className="-z-20 object-cover object-top" />
        ) : (
          <div className="absolute inset-0 -z-20 bg-bg">
            <PentagonField className="absolute -right-[25%] -top-[5%] w-[120%] md:right-0 md:w-[60%]" />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/60 to-black/10" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/85 via-black/30 to-transparent md:block" />

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 md:px-10 md:pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {title.kind === 'series' ? 'Series' : 'Film'}
            </p>
            <h1 className="mt-2 text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">{title.name}</h1>

            <ul className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-2">
              {title.maturity_rating && (
                <li className="rounded-md border border-white/40 px-2 py-0.5 text-xs font-semibold">{title.maturity_rating}</li>
              )}
              {facts.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  {(i > 0 || title.maturity_rating) && <span className="size-1 rounded-full bg-ink-muted" />}
                  {f}
                </li>
              ))}
              {title.is_free && <li className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-gold-ink">Free</li>}
            </ul>

            {first ? (
              <Link
                href={`/watch/${first.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-gold-ink transition-colors hover:bg-gold-hover sm:inline-flex sm:w-auto"
              >
                <PlayIcon className="size-5" />
                {title.kind === 'series' ? `Play ${episodeLabel(first.season_number, first.episode_number)}` : 'Play'}
              </Link>
            ) : (
              <p className="mt-6 inline-block rounded-full bg-surface px-5 py-3 text-sm font-semibold text-ink-2">Coming soon</p>
            )}

            {title.synopsis && <p className="mt-6 text-[15px] leading-relaxed text-ink-2 md:text-lg">{title.synopsis}</p>}
          </div>
        </div>
      </section>

      {title.kind === 'series' && videos.length > 0 && (
        <section aria-label="Episodes" className="mx-auto max-w-[1600px] space-y-8 px-4 md:px-10">
          {[...seasons.entries()].map(([season, eps]) => (
            <div key={season}>
              <h2 className="text-lg font-bold tracking-[-0.02em] md:text-xl">
                {seasons.size > 1 ? `Season ${season}` : 'Episodes'}
              </h2>
              <ol className="mt-3 grid gap-2 md:grid-cols-2">
                {eps.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/watch/${v.id}`}
                      className="group flex items-start gap-4 rounded-[18px] bg-surface p-4 transition-colors hover:bg-surface-2"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2 transition group-hover:bg-gold group-hover:text-gold-ink">
                        <PlayIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-bold">
                            <span className="mr-2 text-ink-muted">{v.episode_number ?? ''}</span>
                            {v.name}
                          </span>
                          <span className="shrink-0 text-xs text-ink-muted">{formatDuration(v.duration_seconds)}</span>
                        </span>
                        {v.synopsis && <span className="mt-1 line-clamp-2 block text-sm text-ink-muted">{v.synopsis}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}

      <Rail heading="More like this" titles={related} />
    </div>
  )
}
