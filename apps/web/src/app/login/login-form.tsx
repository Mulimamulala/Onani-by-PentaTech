'use client'

import { useActionState } from 'react'
import { CheckIcon } from '@/components/icons'
import { sendMagicLink, type LoginState } from './actions'

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {
    status: error ? 'error' : 'idle',
    message: error,
  })

  if (state.status === 'sent') {
    return (
      <div className="mt-6 rounded-[18px] bg-gold-subtle p-4 ring-1 ring-gold-border" role="status">
        <p className="flex items-center gap-2 font-bold text-gold">
          <CheckIcon className="size-4" />
          Link sent
        </p>
        <p className="mt-1 text-sm text-ink-2">{state.message} It can take a minute; check spam too.</p>
      </div>
    )
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="text-sm font-semibold" htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        className="rounded-[14px] border border-hairline bg-bg px-4 py-3.5 text-base outline-none transition placeholder:text-ink-muted focus:border-gold"
      />
      <button
        disabled={pending}
        className="mt-1 rounded-full bg-gold px-4 py-3.5 font-bold text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </button>
      {state.status === 'error' && (
        <p className="text-sm text-negative" role="alert">{state.message}</p>
      )}
    </form>
  )
}
