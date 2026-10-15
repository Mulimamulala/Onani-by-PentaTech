import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { OnaniLogo } from './brand'
import { HeaderShell } from './header-shell'
import { SearchIcon } from './icons'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/browse?type=movie', label: 'Films' },
  { href: '/browse?type=series', label: 'Series' },
  { href: '/browse?free=1', label: 'Free' },
  { href: '/plans', label: 'Plans' },
]

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-8 px-4 md:px-10">
        <OnaniLogo />
        <nav aria-label="Main" className="hidden gap-6 text-sm font-semibold text-ink-2 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/browse"
            aria-label="Browse and search"
            className="grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2/60 hover:text-ink"
          >
            <SearchIcon />
          </Link>
          <Suspense fallback={<div className="size-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </HeaderShell>
  )
}

async function UserMenu() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-bg transition hover:opacity-85"
      >
        Sign in
      </Link>
    )
  }

  const initial = (user.email ?? '?').charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-3">
      {user.isAdmin && (
        <Link
          href="/admin"
          className="hidden rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface sm:inline-block"
        >
          Admin
        </Link>
      )}
      <Link
        href="/account"
        aria-label="Your account"
        className="grid size-9 place-items-center rounded-full bg-surface-2 text-sm font-bold ring-1 ring-hairline transition hover:ring-ink"
      >
        {initial}
      </Link>
    </div>
  )
}
