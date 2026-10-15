'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeroSlide } from '@/lib/catalog'
import { isMuxImage } from '@/lib/images'
import { PentagonField } from './brand'
import { HERO_SHELL, primaryButton, secondaryButton } from './hero-styles'
import { HeroPreview, usePreviewsAllowed } from './hero-preview'
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, PlayIcon, VolumeOffIcon, VolumeOnIcon } from './icons'

const STILL_MS = 8000
const PREVIEW_MS = 16500 // 1.2s start delay + 15s teaser

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const previewsAllowed = usePreviewsAllowed()
  const touchX = useRef<number | null>(null)

  const count = slides.length
  const slide = slides[index]
  const withPreview = Boolean(previewsAllowed && slide.preview)
  const duration = withPreview ? PREVIEW_MS : STILL_MS

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    const t = setTimeout(() => go(index + 1), duration)
    return () => clearTimeout(t)
  }, [index, paused, duration, count, go])

  const meta = [slide.kind === 'series' ? 'Series' : 'Film', slide.release_year, slide.genres[0]].filter(Boolean)

  return (
    <section
      data-hero
      aria-roledescription="carousel"
      aria-label="Featured"
      className={`${HERO_SHELL} min-h-[82svh] md:min-h-[92vh] short:min-h-[100svh]`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      {/* Stills crossfade underneath; only the active slide can play a teaser. */}
      {slides.map((s, i) =>
        s.image ? (
          <Image
            key={s.slug}
            src={s.image}
            alt=""
            fill
            sizes="100vw"
            fetchPriority={i === 0 ? 'high' : 'low'}
            unoptimized={isMuxImage(s.image)}
            className={`-z-30 object-cover object-top transition-[opacity,transform] duration-[1200ms] ease-out-soft ${
              i === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            }`}
          />
        ) : (
          i === index && (
            <div key={s.slug} className="absolute inset-0 -z-30">
              <PentagonField className="absolute -right-[20%] top-[-10%] w-[110%] md:w-[70%]" />
            </div>
          )
        ),
      )}
      {withPreview && slide.preview && <HeroPreview key={slide.slug} preview={slide.preview} muted={muted} />}

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/85 via-black/35 to-transparent md:block" />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 md:px-10 md:pb-16 short:pb-5">
        <div key={slide.slug} className="max-w-2xl animate-[hero-in_700ms_var(--ease-out-soft)_both]">
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-2">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="size-1 rounded-full bg-ink-muted" />}
                {m}
              </span>
            ))}
            {slide.is_free && <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] tracking-wide text-black">Free</span>}
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,min(10vw,12svh),6rem)] font-bold leading-[0.98] tracking-[-0.045em] short:mt-2">{slide.name}</h1>
          {slide.synopsis && (
            <p className="mt-4 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-ink-2 md:text-lg short:hidden">{slide.synopsis}</p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-3 short:mt-4">
            <Link href={`/title/${slide.slug}`} className={primaryButton}>
              <PlayIcon className="size-5" />
              {slide.is_free ? 'Watch free' : 'Play'}
            </Link>
            <Link href={`/title/${slide.slug}`} className={secondaryButton}>
              <InfoIcon className="size-5" />
              More info
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 md:mt-12 short:mt-4">
          {count > 1 && (
            <>
              <div className="flex flex-1 items-center gap-2 md:max-w-md" role="tablist" aria-label="Choose a featured title">
                {slides.map((s, i) => (
                  <button
                    key={s.slug}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={s.name}
                    onClick={() => go(i)}
                    className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/20 py-0 before:absolute before:-inset-y-3 before:inset-x-0"
                  >
                    {i < index && <span className="absolute inset-0 bg-white/70" />}
                    {i === index && (
                      <span
                        key={`${index}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-white"
                        style={{
                          animationName: 'hero-progress',
                          animationDuration: `${duration}ms`,
                          animationTimingFunction: 'linear',
                          animationFillMode: 'forwards',
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="hidden gap-2 md:flex">
                <button onClick={() => go(index - 1)} aria-label="Previous" className={roundButton}>
                  <ChevronLeftIcon className="size-5" />
                </button>
                <button onClick={() => go(index + 1)} aria-label="Next" className={roundButton}>
                  <ChevronRightIcon className="size-5" />
                </button>
              </div>
            </>
          )}
          {withPreview && (
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute preview' : 'Mute preview'}
              className={`${roundButton} ml-auto`}
            >
              {muted ? <VolumeOffIcon className="size-5" /> : <VolumeOnIcon className="size-5" />}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

const roundButton =
  'grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition hover:bg-white/20'
