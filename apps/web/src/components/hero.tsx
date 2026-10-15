import Link from 'next/link'
import { HERO_SHELL, primaryButton, secondaryButton } from './hero-styles'

export { HERO_SHELL, primaryButton, secondaryButton }

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
