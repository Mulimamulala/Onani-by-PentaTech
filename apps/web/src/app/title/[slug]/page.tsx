import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { episodeLabel, formatDuration } from '@onani/core'
import { OnaniMark, PentagonField } from '@/components/brand'
import { HERO_SHELL, primaryButton } from '@/components/hero'
import { PlayIcon } from '@/components/icons'
import { Rail } from '@/components/poster'
import { TitlePreview } from '@/components/title-preview'
import { getAllTitles, getTitleBySlug } from '@/lib/catalog'
import { isMuxImage } from '@/lib/images'

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
      images: title.backdrop_url ?? title.poster_url ?? title.frame_url ?? undefined,
    },
  }
}

export default function TitlePage({ params }: PageProps<'/title/[slug]'>) {
  return (
    <Suspense fallback={<div className="theme-dark h-[72svh] animate-pulse rounded-b-[24px] bg-surface" />}>
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
  const image = title.backdrop_url ?? title.frame_url ?? title.poster_url

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
      <section data-hero className={`${HERO_SHELL} min-h-[72svh] md:min-h-[78vh]`}>
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            fetchPriority="high"
            sizes="100vw"
            unoptimized={isMuxImage(image)}
            className="-z-30 object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 -z-30">
            <PentagonField className="absolute -right-[25%] -top-[5%] w-[120%] md:right-0 md:w-[60%]" />
          </div>
        )}
        {title.preview && <TitlePreview preview={title.preview} />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/85 via-black/30 to-transparent md:block" />

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 md:px-10 md:pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-2">
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
              {title.is_free && <li className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-black">Free</li>}
            </ul>

            {first ? (
              <Link href={`/watch/${first.id}`} className={`${primaryButton} mt-6 w-full py-4 text-base sm:w-auto sm:px-9`}>
                <PlayIcon className="size-5" />
                {title.kind === 'series' ? `Play ${episodeLabel(first.season_number, first.episode_number)}` : 'Play'}
              </Link>
            ) : (
              <p className="mt-6 inline-block rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-ink-2 backdrop-blur">Coming soon</p>
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
              <ol className="mt-4 grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {eps.map((v) => (
                  <li key={v.id}>
                    <Link href={`/watch/${v.id}`} className="group block">
                      <div className="theme-dark relative aspect-video overflow-hidden rounded-[14px] bg-surface shadow-sm ring-1 ring-black/5">
                        {v.frame_url ? (
                          <Image
                            src={v.frame_url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            unoptimized
                            className="object-cover transition duration-500 ease-out-soft md:group-hover:scale-[1.04]"
                          />
                        ) : (
                          <OnaniMark className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 opacity-40" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/40 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                          <PlayIcon className="size-5" />
                        </span>
                        {v.duration_seconds && (
                          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {formatDuration(v.duration_seconds)}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 truncate font-bold">
                        {v.episode_number != null && <span className="mr-2 text-ink-muted">{v.episode_number}.</span>}
                        {v.name}
                      </p>
                      {v.synopsis && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{v.synopsis}</p>}
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
