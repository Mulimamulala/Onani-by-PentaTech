'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/login/actions'
import { ChevronDownIcon, GridIcon, LogOutIcon, ShieldIcon, UserIcon } from './icons'

/** Avatar button with a small dropdown: account, admin, sign out. */
export function AccountMenu({ email, isAdmin }: { email: string | null; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initial = (email ?? '?').charAt(0).toUpperCase()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition hover:bg-surface-2/60"
      >
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-surface-2 to-hairline text-sm font-bold text-ink ring-1 ring-hairline">
          {initial}
        </span>
        <ChevronDownIcon className={`size-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-64 origin-top-right animate-[menu-in_160ms_var(--ease-out-soft)_both] rounded-[18px] border border-hairline-soft bg-bg/95 p-1.5 shadow-2xl backdrop-blur-2xl"
        >
          <div className="px-3 pb-2 pt-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Signed in</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{email}</p>
          </div>
          <div className="my-1 h-px bg-hairline-soft" />
          <Link href="/account" role="menuitem" className={item} onClick={() => setOpen(false)}>
            <UserIcon className="size-4" /> Account
          </Link>
          <Link href="/browse" role="menuitem" className={item} onClick={() => setOpen(false)}>
            <GridIcon className="size-4" /> Browse
          </Link>
          {isAdmin && (
            <Link href="/admin" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <ShieldIcon className="size-4" /> Admin
            </Link>
          )}
          <div className="my-1 h-px bg-hairline-soft" />
          <form action={signOut}>
            <button role="menuitem" className={item}>
              <LogOutIcon className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
