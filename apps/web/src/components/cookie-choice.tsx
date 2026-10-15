'use client'

import { useCookieConsent } from '@/lib/cookie-consent'
import { useHydrated } from '@/lib/use-hydrated'
import { choose } from './cookie-banner'

/** Lets the viewer see and change their cookie choice at any time. */
export function CookieChoice() {
  const hydrated = useHydrated()
  const consent = useCookieConsent()

  const option = (value: 'essential' | 'all', label: string, note: string) => {
    const selected = hydrated && consent === value
    return (
      <button
        role="radio"
        aria-checked={selected}
        onClick={() => choose(value)}
        className={`flex-1 rounded-[14px] p-4 text-left ring-1 transition ${
          selected ? 'bg-surface ring-2 ring-ink' : 'ring-hairline-soft hover:bg-surface'
        }`}
      >
        <span className="block font-semibold text-ink">{label}</span>
        <span className="mt-1 block text-sm text-ink-muted">{note}</span>
      </button>
    )
  }

  return (
    <div role="radiogroup" aria-label="Cookie choice" className="flex flex-col gap-3 sm:flex-row">
      {option('essential', 'Essential only', 'Sign-in and your preferences.')}
      {option('all', 'Allow analytics', 'Also measure playback quality.')}
    </div>
  )
}
