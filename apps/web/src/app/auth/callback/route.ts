import { NextResponse, type NextRequest } from 'next/server'
import { recordAcceptance } from '@/lib/consent'
import { LEGAL_VERSION } from '@/lib/legal'
import { createClient } from '@/lib/supabase/server'

// Magic-link landing: exchanges the one-time code for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // They ticked the boxes on the sign-in form for this exact version.
      const accepted = searchParams.get('accept') === LEGAL_VERSION
      if (accepted && data.user && data.user.app_metadata?.terms_version !== LEGAL_VERSION) {
        await recordAcceptance(data.user.id)
        await supabase.auth.refreshSession()
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`)
}
