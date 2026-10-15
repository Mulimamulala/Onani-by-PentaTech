import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { canWatch, episodeLabel } from '@onani/core'
import { requireUser } from '@/lib/auth'
import { signPlayback } from '@/lib/mux'
import { createAdminClient, createClient } from '@/lib/supabase/server'
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
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Subscribe to watch {video.title.name}</h1>
        <p className="mt-2 text-muted">Pick a plan to unlock the full Onani catalog.</p>
        <Link href="/plans" className="mt-6 inline-block rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground">
          See plans
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
    <div className="bg-black">
      <Player
        videoId={video.id}
        playbackId={video.mux_playback_id}
        tokens={tokens}
        startTime={startTime}
        title={label}
        viewerUserId={user.id}
      />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8">
        <Link href={`/title/${video.title.slug}`} className="text-sm text-muted hover:text-foreground">
          ← {video.title.name}
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{label}</h1>
      </div>
    </div>
  )
}
