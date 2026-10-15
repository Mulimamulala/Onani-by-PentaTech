'use client'

import { useSyncExternalStore } from 'react'
import { CONSENT_COOKIE } from './legal'

export type CookieConsent = 'all' | 'essential'

const EVENT = 'onani:cookie-consent'

function read(): CookieConsent | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|essential)`))
  return (match?.[1] as CookieConsent | undefined) ?? null
}

export function saveCookieConsent(value: CookieConsent) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  return () => window.removeEventListener(EVENT, callback)
}

/**
 * The viewer's cookie choice, or null if they haven't chosen. Always null on the
 * server and during hydration, so nothing that depends on it causes a mismatch.
 */
export function useCookieConsent(): CookieConsent | null {
  return useSyncExternalStore(subscribe, read, () => null)
}
