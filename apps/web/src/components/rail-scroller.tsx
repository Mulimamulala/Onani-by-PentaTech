'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

/** Horizontal rail with edge arrows on pointer devices; touch users just swipe. */
export function RailScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 8)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrow =
    'absolute top-0 z-10 hidden h-[calc(100%-2.5rem)] w-14 items-center justify-center text-ink opacity-0 transition-opacity duration-300 group-hover/rail:opacity-100 focus-visible:opacity-100 md:flex'

  return (
    <div className="group/rail relative">
      <ul
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 pt-1 md:scroll-px-10 md:gap-4 md:px-10"
      >
        {children}
      </ul>
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className={`${arrow} left-0 bg-gradient-to-r from-bg via-bg/70 to-transparent`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-bg/80 shadow-lg ring-1 ring-hairline-soft backdrop-blur">
            <ChevronLeftIcon className="size-5" />
          </span>
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className={`${arrow} right-0 bg-gradient-to-l from-bg via-bg/70 to-transparent`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-bg/80 shadow-lg ring-1 ring-hairline-soft backdrop-blur">
            <ChevronRightIcon className="size-5" />
          </span>
        </button>
      )}
    </div>
  )
}
