'use client'

import MuxVideo from '@mux/mux-video-react'
import { useEffect, useState } from 'react'
import type { PreviewClip } from '@/lib/mux'

type NetworkInfo = { saveData?: boolean; effectiveType?: string }

/**
 * Teasers cost data, so they only play when the viewer can afford it: no
 * reduced-motion preference, no Data Saver, and a 4G-class connection.
 */
export function usePreviewsAllowed() {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const net = (navigator as Navigator & { connection?: NetworkInfo }).connection
    const slow = net?.saveData || (net?.effectiveType && net.effectiveType !== '4g')
    // Reading browser-only signals once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(!reduced && !slow)
  }, [])
  return allowed
}

/** A muted, cover-fitted teaser that fades in over the still once it is actually playing. */
export function HeroPreview({
  preview,
  muted,
  loop = true,
  delayMs = 1200,
}: {
  preview: PreviewClip
  muted: boolean
  loop?: boolean
  delayMs?: number
}) {
  const [mounted, setMounted] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs)
    return () => clearTimeout(t)
  }, [delayMs])

  if (!mounted) return null

  return (
    <MuxVideo
      aria-hidden="true"
      tabIndex={-1}
      playbackId={preview.playbackId}
      tokens={{ playback: preview.token }}
      streamType="on-demand"
      maxResolution="720p"
      autoPlay
      muted={muted}
      loop={loop}
      playsInline
      disablePictureInPicture
      disableTracking
      onPlaying={() => setPlaying(true)}
      className={`pointer-events-none absolute inset-0 -z-20 size-full object-cover transition-opacity duration-1000 ease-out-soft ${
        playing ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
