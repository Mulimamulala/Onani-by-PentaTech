'use client'

import Link from 'next/link'
import { recordCookieConsent } from '@/app/consent-actions'
import { saveCookieConsent, useCookieConsent, type CookieConsent } from '@/lib/cookie-consent'
import { useHydrated } from '@/lib/use-hydrated'

export function choose(value: CookieConsent) {
  saveCookieConsent(value)
  void recordCookieConsent(value === 'all')
}

/** Shown until the viewer picks; sits above the mobile tab bar. */
export function CookieBanner() {
  const hydrated = useHydrated()
  const consent = useCookieConsent()
  if (!hydrated || consent) return null

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="fixed inset-x-2 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 animate-[menu-in_200ms_var(--ease-out-soft)_both] md:inset-x-auto md:bottom-6 md:right-6 md:max-w-md"
    >
      <div className="rounded-[20px] border border-hairline-soft bg-bg/95 p-5 shadow-2xl backdrop-blur-2xl">
        <p className="font-bold tracking-tight">Cookies on Onani</p>
        <p className="mt-1.5 text-sm text-ink-2">
          We use essential cookies to keep you signed in. With your OK we also measure playback quality to reduce
          buffering. No advertising cookies.{' '}
          <Link href="/cookies" className="font-semibold text-ink underline underline-offset-2">Cookie Policy</Link>
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => choose('essential')}
            className="flex-1 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-hairline"
          >
            Essential only
          </button>
          <button
            onClick={() => choose('all')}
            className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-bg transition hover:opacity-85"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
