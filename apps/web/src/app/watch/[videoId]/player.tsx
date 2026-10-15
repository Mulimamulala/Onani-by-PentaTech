'use client'

import MuxPlayer from '@mux/mux-player-react'
import { useEffect, useRef, useState } from 'react'
import type { PlaybackTokens } from '@/lib/mux'
import { saveProgress } from './actions'

const SAVE_EVERY_SECONDS = 15
const STAGE_ID = 'onani-player-stage'

// Spots the watermark drifts between, as % of the frame.
const SPOTS = [
  { top: 12, left: 8 },
  { top: 70, left: 62 },
  { top: 40, left: 30 },
  { top: 18, left: 58 },
  { top: 78, left: 12 },
]

export function Player(props: {
  videoId: string
  playbackId: string
  tokens: PlaybackTokens
  startTime: number
  title: string
  viewerUserId: string
  watermark: string
}) {
  const lastSaved = useRef(props.startTime)
  const [spot, setSpot] = useState(0)
  const [shielded, setShielded] = useState(false)

  function save(position: number, completed = false) {
    lastSaved.current = position
    void saveProgress(props.videoId, position, completed)
  }

  // Deterrents only; real capture blocking needs DRM. A drifting, viewer-specific
  // watermark makes any leaked recording traceable to the account it came from.
  useEffect(() => {
    const move = setInterval(() => setSpot((s) => (s + 1) % SPOTS.length), 20_000)

    // Print Screen (Windows) briefly blacks out the frame and clears the clipboard.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'PrintScreen') return
      setShielded(true)
      navigator.clipboard?.writeText('').catch(() => {})
      setTimeout(() => setShielded(false), 1500)
    }
    window.addEventListener('keyup', onKey)
    return () => {
      clearInterval(move)
      window.removeEventListener('keyup', onKey)
    }
  }, [])

  const { top, left } = SPOTS[spot]

  return (
    <div
      id={STAGE_ID}
      className="relative mx-auto aspect-video w-full max-w-[calc(80vh*16/9)] select-none bg-black short:max-w-[calc((100svh-4rem)*16/9)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <MuxPlayer
        className="size-full"
        streamType="on-demand"
        playbackId={props.playbackId}
        tokens={props.tokens}
        startTime={props.startTime}
        accentColor="#ffffff"
        primaryColor="#ffffff"
        fullscreenElement={STAGE_ID}
        autoPlay
        metadata={{
          video_id: props.videoId,
          video_title: props.title,
          viewer_user_id: props.viewerUserId,
        }}
        onTimeUpdate={(e) => {
          const t = (e.target as HTMLMediaElement).currentTime
          if (Math.abs(t - lastSaved.current) >= SAVE_EVERY_SECONDS) save(t)
        }}
        onPause={(e) => save((e.target as HTMLMediaElement).currentTime)}
        onEnded={(e) => save((e.target as HTMLMediaElement).currentTime, true)}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-10 whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/25 transition-all duration-[2000ms] ease-in-out md:text-sm"
        style={{ top: `${top}%`, left: `${left}%` }}
      >
        {props.watermark}
      </span>
      {shielded && <div aria-hidden="true" className="absolute inset-0 z-20 bg-black" />}
    </div>
  )
}
