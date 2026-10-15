'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GridIcon, HomeIcon, TicketIcon, UserIcon } from './icons'

const TABS = [
  { href: '/', label: 'Home', Icon: HomeIcon, match: (p: string) => p === '/' },
  { href: '/browse', label: 'Browse', Icon: GridIcon, match: (p: string) => p.startsWith('/browse') || p.startsWith('/title') },
  { href: '/plans', label: 'Plans', Icon: TicketIcon, match: (p: string) => p.startsWith('/plans') },
  { href: '/account', label: 'Account', Icon: UserIcon, match: (p: string) => p.startsWith('/account') || p.startsWith('/login') },
]

/** Mobile tab bar, the primary navigation under 768px. */
export function BottomNav() {
  const pathname = usePathname()
  if (pathname.startsWith('/watch')) return null

  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft bg-bg/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid h-16 grid-cols-4">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ink" />}
                <Icon className="size-[22px]" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
