'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Over a dark hero the header is transparent with light text; once the page
 * scrolls (or on pages without a hero) it becomes a solid, theme-aware bar.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [overHero, setOverHero] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ease-out-soft ${
        transparent
          ? 'theme-dark bg-gradient-to-b from-black/70 to-transparent'
          : 'border-b border-hairline-soft bg-bg/85 backdrop-blur-xl'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {children}
    </header>
  )
}
