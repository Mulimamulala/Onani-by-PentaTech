import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { PentagonField, Wordmark } from '@/components/brand'
import { requireUser } from '@/lib/auth'
import { MIN_AGE } from '@/lib/legal'
import { acceptTerms } from '../consent-actions'

export const metadata: Metadata = { title: 'Before you continue', robots: { index: false } }

export default function AcceptPage({ searchParams }: PageProps<'/accept'>) {
  return (
    <div className="relative isolate flex min-h-[90svh] items-center justify-center overflow-hidden px-4 pb-10 pt-20 short:pt-16">
      <PentagonField className="absolute left-1/2 top-1/2 -z-10 w-[160%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="w-full max-w-md rounded-[24px] bg-surface/90 p-6 ring-1 ring-hairline-soft backdrop-blur-xl md:p-8">
        <Wordmark className="text-2xl" />
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Before you continue.</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Please read and accept our terms. We&apos;ll ask again only if they change.
        </p>
        <Suspense>
          <AcceptForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function AcceptForm({ searchParams }: { searchParams: PageProps<'/accept'>['searchParams'] }) {
  await requireUser('/accept')
  const { next, missing } = await searchParams
  const box = 'mt-0.5 size-5 shrink-0 accent-[var(--ink)]'

  return (
    <form action={acceptTerms} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={typeof next === 'string' ? next : '/'} />
      <label className="flex gap-3 text-[15px] text-ink-2">
        <input type="checkbox" name="agree" required className={box} />
        <span>
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="font-semibold text-ink underline underline-offset-2">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" target="_blank" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link>.
        </span>
      </label>
      <label className="flex gap-3 text-[15px] text-ink-2">
        <input type="checkbox" name="age" required className={box} />
        <span>I am {MIN_AGE} or older, or I have permission from a parent or guardian who holds this account.</span>
      </label>
      {missing && <p className="text-sm text-negative" role="alert">Please tick both boxes to continue.</p>}
      <button className="w-full rounded-full bg-ink px-4 py-3.5 font-bold text-bg transition hover:opacity-85 active:scale-[0.98]">
        Accept and continue
      </button>
    </form>
  )
}
