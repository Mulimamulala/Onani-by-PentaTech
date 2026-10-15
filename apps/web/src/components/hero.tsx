import Image from 'next/image'
import Link from 'next/link'
import type { Title } from '@onani/db'
import { isMuxImage } from '@/lib/images'
import { OnaniMark, PentagonField } from './brand'
import { InfoIcon, PlayIcon } from './icons'

type HeroTitle = Pick<Title, 'slug' | 'name' | 'synopsis' | 'backdrop_url' | 'poster_url' | 'kind' | 'release_year' | 'genres' | 'is_free' | 'maturity_rating'> & {
  frame_url?: string | null
}

/** Dark "cinema" island: stays dark in Light mode, rounded off where the page turns light. */
export const HERO_SHELL =
  'theme-dark relative isolate flex items-end overflow-hidden bg-bg rounded-b-[24px] md:rounded-b-[32px]'

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[15px] font-bold text-bg transition hover:opacity-85'
export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-[15px] font-semibold text-ink backdrop-blur-md transition-colors hover:bg-white/25'

/** Full-bleed artwork with text bottom-left on a scrim, per the design system's photo rule. */
export function Hero({ title }: { title: HeroTitle }) {
  const meta = [title.kind === 'series' ? 'Series' : 'Film', title.release_year, title.genres[0]].filter(Boolean)
  const image = title.backdrop_url ?? title.frame_url ?? title.poster_url

  return (
    <section data-hero className={`${HERO_SHELL} min-h-[78svh] md:min-h-[86vh]`}>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          fetchPriority="high"
          sizes="100vw"
          unoptimized={isMuxImage(image)}
          className="-z-20 object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 -z-20">
          <PentagonField className="absolute -right-[20%] top-[-10%] w-[110%] max-w-[1100px] md:-right-[5%] md:w-[70%]" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/80 via-black/30 to-transparent md:block" />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 md:px-10 md:pb-20">
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-2">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="size-1 rounded-full bg-ink-muted" />}
                {m}
              </span>
            ))}
          </p>
          <h1 className="mt-3 text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">{title.name}</h1>
          {title.synopsis && (
            <p className="mt-4 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-ink-2 md:text-lg">{title.synopsis}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/title/${title.slug}`} className={primaryButton}>
              <PlayIcon className="size-5" />
              {title.is_free ? 'Watch free' : 'Play'}
            </Link>
            <Link href={`/title/${title.slug}`} className={secondaryButton}>
              <InfoIcon className="size-5" />
              More info
            </Link>
            {title.maturity_rating && (
              <span className="rounded-md border border-white/40 px-2 py-1 text-xs font-semibold text-ink-2">{title.maturity_rating}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Brand-led hero for when the catalog is still empty. */
export function WelcomeHero({ priceLabel }: { priceLabel: string | null }) {
  return (
    <section data-hero className={`${HERO_SHELL} min-h-[78svh] md:min-h-[86vh]`}>
      <PosterWall />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black via-black/60 to-transparent md:block" />
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-10 md:pb-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-2">Onani means “watch”</p>
        <h1 className="mt-3 max-w-3xl text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">
          Films and series, made to watch anywhere.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2 md:text-lg">
          Stream on your phone, laptop or TV.{priceLabel ? ` Plans from ${priceLabel}.` : ''} Pay with Airtel Money, MTN MoMo or card.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/plans" className={primaryButton}>See plans</Link>
          <Link href="/browse" className={secondaryButton}>Browse</Link>
        </div>
      </div>
    </section>
  )
}

/** A tilted wall of poster frames: reads as "a catalog" before any art exists. */
function PosterWall() {
  const tiles = Array.from({ length: 40 }, (_, i) => i)
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-[20%] -top-[10%] grid w-[150%] rotate-[-8deg] grid-cols-5 gap-3 sm:grid-cols-6 md:-left-[5%] md:w-[120%] md:grid-cols-8 md:gap-4">
        {tiles.map((i) => (
          <div
            key={i}
            className={`relative aspect-[2/3] overflow-hidden rounded-[14px] ring-1 ring-white/5 ${i % 3 === 0 ? 'bg-surface-2' : 'bg-surface'}`}
          >
            {i === 9 && <OnaniMark className="absolute left-3 top-3 size-5" />}
            <div className="absolute inset-x-3 bottom-3 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-white/10" />
              <div className="h-2 w-1/2 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
