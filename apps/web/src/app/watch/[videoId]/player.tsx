'use client'

import MuxPlayer from '@mux/mux-player-react'
import { useRef } from 'react'
import type { PlaybackTokens } from '@/lib/mux'
import { saveProgress } from './actions'

const SAVE_EVERY_SECONDS = 15

export function Player(props: {
  videoId: string
  playbackId: string
  tokens: PlaybackTokens
  startTime: number
  title: string
  viewerUserId: string
}) {
  const lastSaved = useRef(props.startTime)

  function save(position: number, completed = false) {
    lastSaved.current = position
    void saveProgress(props.videoId, position, completed)
  }

  return (
    <MuxPlayer
      className="mx-auto aspect-video max-h-[80vh] w-full"
      streamType="on-demand"
      playbackId={props.playbackId}
      tokens={props.tokens}
      startTime={props.startTime}
      accentColor="#daa520"
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
  )
}
