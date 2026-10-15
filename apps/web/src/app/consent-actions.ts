'use server'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LEGAL_VERSION } from '@/lib/legal'
import { recordAcceptance } from '@/lib/consent'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '/'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

/** Logs a signed-in viewer's cookie choice; anonymous choices live only in the cookie. */
export async function recordCookieConsent(granted: boolean) {
  const user = await getCurrentUser()
  if (!user) return
  const supabase = await createClient()
  await supabase.from('consents').insert({ user_id: user.id, kind: 'cookies_analytics', version: LEGAL_VERSION, granted })
}

/**
 * Records acceptance of the current Terms, Privacy Policy and age requirement.
 * The accepted version is also written to app_metadata (server-controlled, in the
 * session token) so the proxy can gate every request without a database read.
 */
export async function acceptTerms(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/accept')

  if (formData.get('agree') !== 'on' || formData.get('age') !== 'on') {
    redirect(`/accept?next=${encodeURIComponent(safeNext(formData.get('next')))}&missing=1`)
  }

  await recordAcceptance(user.id)

  // Refresh so the new token (with terms_version) replaces the session cookie now.
  const supabase = await createClient()
  await supabase.auth.refreshSession()

  redirect(safeNext(formData.get('next')))
}
