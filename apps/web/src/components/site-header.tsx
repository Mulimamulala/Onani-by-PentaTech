import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { AccountMenu } from './account-menu'
import { OnaniLogo } from './brand'
import { HeaderShell } from './header-shell'
import { NavPills, NavPillsFallback } from './nav-pills'
import { SearchButton } from './search-button'

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-4 px-2 md:h-16 md:grid-cols-[1fr_auto_1fr] md:px-6 short:h-12">
        <OnaniLogo />
        <div className="hidden md:block">
          <Suspense fallback={<NavPillsFallback />}>
            <NavPills />
          </Suspense>
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <SearchButton />
          <Suspense fallback={<div className="size-10" />}>
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
        className="rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-bg transition hover:opacity-85 active:scale-[0.98]"
      >
        Sign in
      </Link>
    )
  }

  return <AccountMenu email={user.email} isAdmin={user.isAdmin} />
}
