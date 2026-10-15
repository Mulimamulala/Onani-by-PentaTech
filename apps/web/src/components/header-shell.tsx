'use client'

import { useEffect, useState, type ReactNode } from 'react'

/** Transparent over the hero, solid once the page scrolls. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ease-out-soft ${
        scrolled ? 'border-b border-hairline-soft bg-bg/90 backdrop-blur-xl' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {children}
    </header>
  )
}
