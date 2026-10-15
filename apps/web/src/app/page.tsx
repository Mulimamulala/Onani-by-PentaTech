import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { formatPrice, progressFraction } from '@onani/core'
import { WelcomeHero } from '@/components/hero'
import { HeroCarousel } from '@/components/hero-carousel'
import { CheckIcon, PlayIcon, TicketIcon } from '@/components/icons'
import { Rail } from '@/components/poster'
import { getCurrentUser } from '@/lib/auth'
import { getActivePlans, getHeroSlides, getHomeCatalog } from '@/lib/catalog'
import { isMuxImage } from '@/lib/images'
import { signedThumbnailUrl } from '@/lib/mux'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const [{ latest, free, films, series, genres, total }, slides, plans] = await Promise.all([
    getHomeCatalog(),
    getHeroSlides(),
    getActivePlans(),
  ])
  const cheapest = plans[0]
  const priceLabel = cheapest ? `${formatPrice(cheapest.price_minor, cheapest.currency)} a week` : null

  return (
    <div className="space-y-10 md:space-y-14">
      {slides.length > 0 ? <HeroCarousel slides={slides} /> : <WelcomeHero priceLabel={priceLabel} />}

      <div className="mx-auto w-full max-w-[1600px] space-y-10 md:space-y-12">
        <Suspense fallback={null}>
          <ContinueWatching />
        </Suspense>
        <Suspense fallback={null}>
          <SignedOutPitch priceLabel={priceLabel} />
        </Suspense>

        {total === 0 ? (
          <EmptyCatalog />
        ) : (
          <>
            <Rail heading="New on Onani" titles={latest} href="/browse" />
            <Rail heading="Watch free" titles={free} href="/browse?free=1" />
            <Rail heading="Series" titles={series} href="/browse?type=series" />
            <Rail heading="Films" titles={films} href="/browse?type=movie" />
            {genres.map(([genre, titles]) => (
              <Rail key={genre} heading={genre} titles={titles} href={`/browse?genre=${encodeURIComponent(genre)}`} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

async function SignedOutPitch({ priceLabel }: { priceLabel: string | null }) {
  const user = await getCurrentUser()
  if (user) return null

  const points = [
    { Icon: PlayIcon, title: 'Watch anywhere', body: 'Phone, laptop or TV. Picks up where you left off.' },
    { Icon: TicketIcon, title: 'Pay your way', body: 'Airtel Money, MTN MoMo, Zamtel Kwacha or card.' },
    { Icon: CheckIcon, title: priceLabel ? `From ${priceLabel}` : 'Flexible plans', body: 'Weekly or monthly. No contracts, cancel anytime.' },
  ]

  return (
    <section aria-label="Why Onani" className="px-4 md:px-10">
      <ul className="no-scrollbar mx-auto flex max-w-[1600px] snap-x gap-3 overflow-x-auto md:grid md:grid-cols-3 md:gap-4">
        {points.map((p) => (
          <li key={p.title} className="w-[78%] shrink-0 snap-start rounded-[18px] bg-surface p-5 md:w-auto">
            <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink">
              <p.Icon className="size-4" />
            </span>
            <p className="mt-3 font-bold tracking-tight">{p.title}</p>
            <p className="mt-1 text-sm text-ink-muted">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

async function ContinueWatching() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('watch_progress')
    .select('position_seconds, video:videos (id, name, duration_seconds, mux_playback_id, title:titles (slug, name, backdrop_url))')
    .eq('user_id', user.id)
    .eq('completed', false)
    .order('updated_at', { ascending: false })
    .limit(12)

  const rows = (data ?? []).filter((row) => row.video?.title)
  if (rows.length === 0) return null

  // Show the frame where the viewer stopped, not a generic poster.
  const items = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      image: row.video!.mux_playback_id
        ? await signedThumbnailUrl(row.video!.mux_playback_id, { width: 640, time: Number(row.position_seconds) })
        : row.video!.title!.backdrop_url,
    })),
  )

  return (
    <section aria-label="Continue watching" className="space-y-3">
      <h2 className="px-4 text-lg font-bold tracking-[-0.02em] md:px-10 md:text-xl">Continue watching</h2>
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:scroll-px-10 md:gap-4 md:px-10">
        {items.map(({ video, position_seconds, image }) => (
          <li key={video!.id} className="w-[260px] shrink-0 snap-start md:w-[320px]">
            <Link href={`/watch/${video!.id}`} className="group block">
              <div
                className="theme-dark relative aspect-video overflow-hidden rounded-[14px] bg-surface shadow-sm ring-1 ring-black/5"
              >
                {image && (
                  <Image src={image} alt="" fill sizes="320px" unoptimized={isMuxImage(image)} className="object-cover transition duration-500 ease-out-soft md:group-hover:scale-[1.04]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/40 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                  <PlayIcon className="size-5" />
                </span>
                <div className="absolute inset-x-3 bottom-3">
                  <p className="truncate text-sm font-bold">{video!.title!.name}</p>
                  <p className="truncate text-xs text-ink-2">{video!.name}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${progressFraction(position_seconds, video!.duration_seconds) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyCatalog() {
  return (
    <section className="px-4 md:px-10">
      <div className="mx-auto max-w-[1600px] rounded-[24px] bg-surface p-8 text-center md:p-14">
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em]">New titles are on the way.</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          We&apos;re adding films and series now. Sign in so you&apos;re ready to press play.
        </p>
      </div>
    </section>
  )
}
