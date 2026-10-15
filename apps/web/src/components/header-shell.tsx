'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A floating glass bar. Over a dark hero it is transparent with light text;
 * once the page scrolls (or on pages without a hero) it turns solid and
 * theme-aware. It tucks away while scrolling down and returns on scroll up.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [overHero, setOverHero] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // Ignore tiny jitters; never hide near the top.
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 320)
        lastY.current = y
      }
    }
    const checkHero = () => setOverHero(Boolean(document.querySelector('[data-hero]')))
    onScroll()
    checkHero()
    window.addEventListener('scroll', onScroll, { passive: true })
    // Client navigations swap the page without remounting the header.
    const observer = new MutationObserver(checkHero)
    observer.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  const transparent = overHero && !scrolled

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 px-2 pt-2 transition-transform duration-500 ease-out-soft md:px-4 md:pt-3 ${
        hidden ? '-translate-y-[120%]' : 'translate-y-0'
      } ${transparent ? 'theme-dark' : ''}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
    >
      <div
        className={`mx-auto max-w-[1600px] rounded-[20px] transition-[background-color,box-shadow,border-color] duration-500 ease-out-soft ${
          transparent
            ? 'border border-transparent bg-transparent'
            : 'border border-hairline-soft bg-bg/75 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150'
        }`}
      >
        {children}
      </div>
    </header>
  )
}
