import Image from 'next/image'
import Link from 'next/link'
import type { Title } from '@onani/db'
import { isMuxImage } from '@/lib/images'
import { OnaniMark, PentagonField } from './brand'
import { ChevronRightIcon, PlayIcon } from './icons'
import { RailScroller } from './rail-scroller'

export type PosterTitle = Pick<Title, 'slug' | 'name' | 'poster_url' | 'release_year' | 'is_free' | 'kind'> & {
  frame_url?: string | null
}

function Label({ title }: { title: PosterTitle }) {
  return (
    <div className="relative">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
        {title.kind === 'series' ? 'Series' : 'Film'}
      </p>
      <p className="mt-1 line-clamp-3 text-base font-bold leading-tight tracking-tight text-white sm:text-lg">{title.name}</p>
    </div>
  )
}

/** No poster, but a video frame: crop the frame and set the title on it. */
function FrameArt({ title, src, sizes }: { title: PosterTitle; src: string; sizes: string }) {
  return (
    <div className="theme-dark relative flex h-full flex-col justify-end p-3">
      <Image src={src} alt="" fill sizes={sizes} unoptimized={isMuxImage(src)} className="-z-10 object-cover transition duration-500 ease-out-soft md:group-hover:scale-[1.04]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <Label title={title} />
    </div>
  )
}

/** Nothing uploaded yet: a designed stand-in that still reads as a poster. */
function PlaceholderArt({ title }: { title: PosterTitle }) {
  return (
    <div className="theme-dark relative flex h-full flex-col justify-between overflow-hidden bg-surface p-3">
      <PentagonField className="absolute -right-1/3 -top-1/4 w-[140%]" />
      <OnaniMark className="relative size-5 self-end" />
      <Label title={title} />
    </div>
  )
}

export function PosterCard({
  title,
  sizes = '(min-width: 1024px) 200px, (min-width: 640px) 168px, 132px',
}: {
  title: PosterTitle
  sizes?: string
}) {
  const hasArtwork = Boolean(title.poster_url)
  return (
    <Link href={`/title/${title.slug}`} className="group block outline-none" aria-label={title.name}>
      <div className="relative isolate aspect-[2/3] overflow-hidden rounded-[14px] bg-surface shadow-sm ring-1 ring-black/5 transition duration-300 ease-out-soft group-focus-visible:ring-2 group-focus-visible:ring-gold md:group-hover:-translate-y-1 md:group-hover:shadow-xl">
        {title.poster_url ? (
          <Image src={title.poster_url} alt="" fill sizes={sizes} className="object-cover transition duration-500 ease-out-soft md:group-hover:scale-[1.04]" />
        ) : title.frame_url ? (
          <FrameArt title={title} src={title.frame_url} sizes={sizes} />
        ) : (
          <PlaceholderArt title={title} />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 hidden place-items-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:grid"
        >
          <span className="grid size-12 scale-90 place-items-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-100">
            <PlayIcon className="size-5" />
          </span>
        </span>
        {title.is_free && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black backdrop-blur">
            Free
          </span>
        )}
      </div>
      {hasArtwork && <p className="mt-2 truncate text-[13px] font-semibold text-ink-2 group-hover:text-ink">{title.name}</p>}
    </Link>
  )
}

/** A horizontally scrolling row of posters with a heading. */
export function Rail({ heading, titles, href }: { heading: string; titles: PosterTitle[]; href?: string }) {
  if (titles.length === 0) return null
  return (
    <section aria-label={heading} className="space-y-3">
      <div className="flex items-end justify-between px-4 md:px-10">
        <h2 className="text-lg font-bold tracking-[-0.02em] md:text-xl">{heading}</h2>
        {href && (
          <Link href={href} className="flex items-center text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink">
            See all
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
      <RailScroller>
        {titles.map((t) => (
          <li key={t.slug} className="w-[132px] shrink-0 snap-start sm:w-[168px] lg:w-[200px]">
            <PosterCard title={t} />
          </li>
        ))}
      </RailScroller>
    </section>
  )
}
