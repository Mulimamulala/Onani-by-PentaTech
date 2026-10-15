import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LEGAL_VERSION } from '@/lib/legal'

const PROTECTED_PREFIXES = ['/admin', '/watch', '/account']
// Reachable before accepting the current Terms.
const OPEN_BEFORE_ACCEPT = ['/accept', '/terms', '/privacy', '/cookies', '/login', '/auth', '/api']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    },
  )

  // Don't run code between createServerClient and getClaims(): it refreshes the session.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const signedIn = Boolean(claims)

  // Optimistic redirect only; pages and actions still check auth themselves.
  const { pathname, search } = request.nextUrl
  if (!signedIn && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return withCookies(NextResponse.redirect(url), response)
  }

  // Signed-in users must accept the current Terms before using the site.
  const acceptedVersion = (claims?.app_metadata as { terms_version?: string } | undefined)?.terms_version
  if (signedIn && acceptedVersion !== LEGAL_VERSION && !OPEN_BEFORE_ACCEPT.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/accept'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return withCookies(NextResponse.redirect(url), response)
  }

  return response
}

/** Redirects must carry any refreshed session cookies, or the user is signed out. */
function withCookies(redirect: NextResponse, from: NextResponse) {
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c))
  return redirect
}
