import 'server-only'
import { LEGAL_VERSION } from '@/lib/legal'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Records that a user accepted the current Terms, Privacy Policy and age
 * requirement, and stamps the version into app_metadata (server-controlled,
 * carried in the session token) so the proxy can gate requests cheaply.
 * Server-only: never expose this as a server action, it trusts its userId.
 */
export async function recordAcceptance(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...(data.user?.app_metadata ?? {}), terms_version: LEGAL_VERSION },
  })
  await admin.from('consents').insert(
    (['terms', 'privacy', 'age'] as const).map((kind) => ({ user_id: userId, kind, version: LEGAL_VERSION, granted: true })),
  )
}
