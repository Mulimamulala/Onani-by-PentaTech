'use client'

import { useActionState } from 'react'
import { sendMagicLink, type LoginState } from './actions'

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {
    status: error ? 'error' : 'idle',
    message: error,
  })

  if (state.status === 'sent') {
    return <p className="rounded-lg border border-border bg-surface p-4 text-sm">{state.message}</p>
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="text-sm font-medium" htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="rounded-md border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent"
      />
      <button
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2.5 font-semibold text-accent-foreground disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </button>
      {state.status === 'error' && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  )
}
