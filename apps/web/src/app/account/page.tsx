import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { isSubscriptionActive } from '@onani/core'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../login/actions'

export const metadata: Metadata = { title: 'Account', robots: { index: false } }

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 md:pt-32">
      <h1 className="text-3xl font-bold tracking-[-0.04em] md:text-5xl">Account</h1>
      <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-[24px] bg-surface" />}>
        <Details />
      </Suspense>
    </div>
  )
}

async function Details() {
  const user = await requireUser('/account')
  const supabase = await createClient()
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, plan:plans (name)')
    .eq('user_id', user.id)
    .order('current_period_end', { ascending: false })

  const active = (subs ?? []).find((s) => isSubscriptionActive(s))
  const renews = active?.current_period_end
    ? new Date(active.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mt-8 space-y-4">
      <section className="rounded-[24px] bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Signed in as</p>
        <p className="mt-1 break-all text-lg font-bold">{user.email}</p>
      </section>

      <section className="rounded-[24px] bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Membership</p>
        {active ? (
          <>
            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
              <span className="size-2.5 rounded-full bg-positive" />
              {active.plan?.name ?? 'Active'} plan
            </p>
            <p className="mt-1 text-sm text-ink-muted">Active until {renews}.</p>
          </>
        ) : (
          <>
            <p className="mt-1 text-lg font-bold">No active plan</p>
            <p className="mt-1 text-sm text-ink-muted">You can still watch titles marked Free.</p>
            <Link
              href="/plans"
              className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-bg transition hover:opacity-85"
            >
              See plans
            </Link>
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        {user.isAdmin && (
          <Link href="/admin" className="rounded-full border border-hairline px-5 py-3 text-sm font-semibold text-ink-muted hover:bg-surface">
            Admin dashboard
          </Link>
        )}
        <form action={signOut}>
          <button className="rounded-full bg-surface-2 px-5 py-3 text-sm font-semibold hover:bg-hairline">Sign out</button>
        </form>
      </div>
    </div>
  )
}
