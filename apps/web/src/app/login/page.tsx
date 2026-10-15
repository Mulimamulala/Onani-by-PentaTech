import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PentagonField, Wordmark } from '@/components/brand'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <div className="relative isolate flex min-h-[90svh] items-center justify-center overflow-hidden px-4 pb-10 pt-20 short:pt-16">
      <PentagonField className="absolute left-1/2 top-1/2 -z-10 w-[160%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="w-full max-w-sm rounded-[24px] bg-surface/90 p-6 ring-1 ring-hairline-soft backdrop-blur-xl md:p-8">
        <Wordmark className="text-2xl" />
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Sign in to watch.</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Enter your email and we&apos;ll send you a link. No password to remember.</p>
        <Suspense>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
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
