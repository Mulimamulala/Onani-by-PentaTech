import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { canWatch, episodeLabel } from '@onani/core'
import { requireUser } from '@/lib/auth'
import { signPlayback } from '@/lib/mux'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ChevronLeftIcon, LockIcon } from '@/components/icons'
import { Player } from './player'

export const metadata: Metadata = { title: 'Watch', robots: { index: false } }

export default function WatchPage({ params }: PageProps<'/watch/[videoId]'>) {
  return (
    <Suspense fallback={<div className="aspect-video w-full animate-pulse bg-black" />}>
      <Watch params={params} />
    </Suspense>
  )
}

async function Watch({ params }: { params: PageProps<'/watch/[videoId]'>['params'] }) {
  const { videoId } = await params
  if (!/^[0-9a-f-]{36}$/i.test(videoId)) notFound()

  const user = await requireUser(`/watch/${videoId}`)

  // The playback ID is read with the secret key: it's only handed out, signed,
  // after the entitlement check below.
  const admin = createAdminClient()
  const { data: video } = await admin
    .from('videos')
    .select('id, name, season_number, episode_number, status, mux_playback_id, title:titles!inner (slug, name, is_free, published_at)')
    .eq('id', videoId)
    .maybeSingle()

  const published = video?.title.published_at && new Date(video.title.published_at) <= new Date()
  if (!video || video.status !== 'ready' || !video.mux_playback_id || (!published && !user.isAdmin)) notFound()

  const supabase = await createClient()
  const [{ data: subscriptions }, { data: progress }] = await Promise.all([
    supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id),
    supabase.from('watch_progress').select('position_seconds, completed').eq('user_id', user.id).eq('video_id', video.id).maybeSingle(),
  ])

  const allowed = user.isAdmin || canWatch({ titleIsFree: video.title.is_free, subscriptions: subscriptions ?? [] })

  if (!allowed) {
    return (
      <div className="mx-auto flex min-h-[80svh] max-w-md flex-col items-center justify-center px-4 pt-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-surface-2 text-ink-muted ring-1 ring-hairline">
          <LockIcon className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Subscribe to watch {video.title.name}.</h1>
        <p className="mt-2 text-ink-muted">One plan unlocks every film and series on Onani. Pay with mobile money or card.</p>
        <Link
          href="/plans"
          className="mt-6 w-full rounded-full bg-ink px-6 py-4 font-bold text-bg transition hover:opacity-85 sm:w-auto"
        >
          See plans
        </Link>
        <Link href={`/title/${video.title.slug}`} className="mt-4 text-sm font-semibold text-ink-muted hover:text-ink">
          Back to {video.title.name}
        </Link>
      </div>
    )
  }

  const tokens = await signPlayback(video.mux_playback_id)
  const startTime = progress && !progress.completed ? Number(progress.position_seconds) : 0
  const label = [video.title.name, episodeLabel(video.season_number, video.episode_number), video.name]
    .filter(Boolean)
    .join(' · ')

  return (
    <div data-hero className="theme-dark min-h-[70svh] bg-black pt-16">
      <Player
        videoId={video.id}
        playbackId={video.mux_playback_id}
        tokens={tokens}
        startTime={startTime}
        title={label}
        viewerUserId={user.id}
        watermark={`${user.email ?? user.id.slice(0, 8)} · Onani`}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-5 md:px-10">
        <Link
          href={`/title/${video.title.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          <ChevronLeftIcon className="size-4" />
          {video.title.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold tracking-[-0.02em] md:text-2xl">{label}</h1>
      </div>
    </div>
  )
}
