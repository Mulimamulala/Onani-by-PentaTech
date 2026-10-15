import Image from 'next/image'
import Link from 'next/link'
import type { Title } from '@onani/db'
import { OnaniMark, PentagonField } from './brand'
import { ChevronRightIcon } from './icons'

export type PosterTitle = Pick<Title, 'slug' | 'name' | 'poster_url' | 'release_year' | 'is_free' | 'kind'>

/** Designed stand-in when a title has no poster yet: still reads as a poster. */
function PosterArt({ title }: { title: PosterTitle }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-surface p-3">
      <PentagonField className="absolute -right-1/3 -top-1/4 w-[140%]" />
      <OnaniMark className="relative size-5" />
      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title.kind === 'series' ? 'Series' : 'Film'}
        </p>
        <p className="mt-1 line-clamp-3 text-base font-bold leading-tight tracking-tight sm:text-lg">{title.name}</p>
      </div>
    </div>
  )
}

export function PosterCard({ title, sizes = '(min-width: 1024px) 200px, (min-width: 640px) 168px, 132px' }: { title: PosterTitle; sizes?: string }) {
  return (
    <Link href={`/title/${title.slug}`} className="group block outline-none" aria-label={title.name}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[14px] bg-surface ring-1 ring-white/5 transition duration-300 ease-out-soft group-hover:ring-gold/60 group-focus-visible:ring-2 group-focus-visible:ring-gold md:group-hover:-translate-y-1">
        {title.poster_url ? (
          <Image src={title.poster_url} alt="" fill sizes={sizes} className="object-cover transition duration-500 ease-out-soft md:group-hover:scale-[1.04]" />
        ) : (
          <PosterArt title={title} />
        )}
        {title.is_free && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-ink">
            Free
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold text-ink-2 group-hover:text-ink">{title.name}</p>
    </Link>
  )
}

/** A horizontally scrolling row of posters with a heading. */
export function Rail({
  heading,
  titles,
  href,
}: {
  heading: string
  titles: PosterTitle[]
  href?: string
}) {
  if (titles.length === 0) return null
  return (
    <section aria-label={heading} className="space-y-3">
      <div className="flex items-end justify-between px-4 md:px-10">
        <h2 className="text-lg font-bold tracking-[-0.02em] md:text-xl">{heading}</h2>
        {href && (
          <Link href={href} className="flex items-center text-[13px] font-semibold text-ink-muted transition-colors hover:text-gold">
            See all
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:scroll-px-10 md:gap-4 md:px-10">
        {titles.map((t) => (
          <li key={t.slug} className="w-[132px] shrink-0 snap-start sm:w-[168px] lg:w-[200px]">
            <PosterCard title={t} />
          </li>
        ))}
      </ul>
    </section>
  )
}
