import Link from 'next/link'
import { PentagonField, Wordmark } from '@/components/brand'

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center">
      <PentagonField className="absolute left-1/2 top-1/2 -z-10 w-[150%] max-w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <Wordmark className="text-4xl" />
      <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] md:text-5xl">We couldn&apos;t find that.</h1>
      <p className="mt-2 max-w-sm text-ink-muted">The title may have moved or isn&apos;t published yet.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-full bg-ink px-6 py-3 font-bold text-bg transition hover:opacity-85">
          Go home
        </Link>
        <Link href="/browse" className="rounded-full bg-surface-2 px-6 py-3 font-semibold transition-colors hover:bg-hairline">
          Browse
        </Link>
      </div>
    </div>
  )
}
