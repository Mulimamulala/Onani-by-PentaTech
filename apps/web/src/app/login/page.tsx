import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20">
      <div>
        <h1 className="text-2xl font-bold">Sign in to Onani</h1>
        <p className="mt-1 text-sm text-muted">We&apos;ll email you a link. No password needed.</p>
      </div>
      <Suspense>
        <LoginFormWithNext searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function LoginFormWithNext({ searchParams }: { searchParams: PageProps<'/login'>['searchParams'] }) {
  const { next, error } = await searchParams
  return (
    <LoginForm
      next={typeof next === 'string' ? next : '/'}
      error={typeof error === 'string' ? 'That sign-in link is invalid or expired. Try again.' : undefined}
    />
  )
}
