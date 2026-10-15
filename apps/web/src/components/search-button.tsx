'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SearchIcon } from './icons'

/** Search pill; "/" jumps to search from anywhere (unless typing in a field). */
export function SearchButton() {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      e.preventDefault()
      const existing = document.getElementById('q') as HTMLInputElement | null
      if (existing) existing.focus()
      else router.push('/browse?focus=1')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <Link
      href="/browse?focus=1"
      aria-label="Search"
      className="group flex items-center gap-2 rounded-full p-2.5 text-ink-2 ring-1 ring-transparent transition hover:text-ink lg:w-56 lg:bg-surface/60 lg:py-2 lg:pl-3.5 lg:pr-2 lg:ring-hairline-soft lg:backdrop-blur-md"
    >
      <SearchIcon className="size-[18px] shrink-0" />
      <span className="hidden flex-1 text-[13px] font-medium text-ink-muted lg:block">Search titles</span>
      <kbd className="hidden rounded-md bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink-muted lg:block">/</kbd>
    </Link>
  )
}
