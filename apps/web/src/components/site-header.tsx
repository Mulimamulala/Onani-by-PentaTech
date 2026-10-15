import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { signOut } from '@/app/login/actions'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          onani<span className="text-accent">.</span>
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/plans" className="hover:text-foreground">Plans</Link>
        </nav>
        <div className="ml-auto">
          <Suspense fallback={<div className="h-8 w-20" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function UserMenu() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {user.isAdmin && (
        <Link href="/admin" className="text-muted hover:text-foreground">Admin</Link>
      )}
      <span className="hidden text-muted sm:inline">{user.email}</span>
      <form action={signOut}>
        <button className="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Sign out</button>
      </form>
    </div>
  )
}
