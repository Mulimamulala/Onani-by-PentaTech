'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export const NAV = [
  { href: '/', label: 'Home', match: (p: string) => p === '/' },
  { href: '/browse?type=movie', label: 'Films', match: (p: string, q: URLSearchParams) => p === '/browse' && q.get('type') === 'movie' },
  { href: '/browse?type=series', label: 'Series', match: (p: string, q: URLSearchParams) => p === '/browse' && q.get('type') === 'series' },
  { href: '/browse?free=1', label: 'Free', match: (p: string, q: URLSearchParams) => p === '/browse' && q.get('free') === '1' },
  { href: '/plans', label: 'Plans', match: (p: string) => p.startsWith('/plans') },
]

const pill = 'relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors'

/** Centered segmented nav; the current section is the inverse pill. */
export function NavPills() {
  const pathname = usePathname()
  const query = useSearchParams()

  return (
    <nav aria-label="Main" className="flex items-center gap-0.5 rounded-full bg-surface/60 p-1 ring-1 ring-hairline-soft backdrop-blur-md">
      {NAV.map((item) => {
        const active = item.match(pathname, query)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`${pill} ${active ? 'bg-ink text-bg shadow-sm' : 'text-ink-2 hover:bg-surface-2/70 hover:text-ink'}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Same shape, no active state: the prerendered placeholder. */
export function NavPillsFallback() {
  return (
    <nav aria-label="Main" className="flex items-center gap-0.5 rounded-full bg-surface/60 p-1 ring-1 ring-hairline-soft">
      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className={`${pill} text-ink-2`}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
