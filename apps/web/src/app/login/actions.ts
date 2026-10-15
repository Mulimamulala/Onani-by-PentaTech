'use server'

import { redirect } from 'next/navigation'
import { LEGAL_VERSION } from '@/lib/legal'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { status: 'idle' | 'sent' | 'error'; message?: string }

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '/'
  // Only allow same-site relative paths to prevent open redirects.
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

/** Emails a magic link. Free on Supabase; no SMS provider needed. */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { status: 'error', message: 'Enter a valid email address.' }
  }

  if (formData.get('agree') !== 'on' || formData.get('age') !== 'on') {
    return { status: 'error', message: 'Please accept the Terms and confirm your age to continue.' }
  }

  const next = safeNext(formData.get('next'))
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  // Acceptance is recorded when the link is opened and the account exists.
  const accept = `&accept=${encodeURIComponent(LEGAL_VERSION)}`

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}${accept}` },
  })

  if (error) return { status: 'error', message: error.message }
  return { status: 'sent', message: `Check ${email} for your sign-in link.` }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
