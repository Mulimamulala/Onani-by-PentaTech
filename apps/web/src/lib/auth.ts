import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CurrentUser = {
  id: string
  email: string | null
  isAdmin: boolean
}

/** The signed-in user, or null. Reads cookies, so render behind <Suspense>. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) return null

  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    // app_metadata is server-controlled; never authorize from user_metadata.
    isAdmin: claims.app_metadata?.role === 'admin',
  }
}

export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login')
  return user
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser('/admin')
  if (!user.isAdmin) redirect('/')
  return user
}
