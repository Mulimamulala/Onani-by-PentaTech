'use client'

import { useState } from 'react'
import type { PreviewClip } from '@/lib/mux'
import { HeroPreview, usePreviewsAllowed } from './hero-preview'
import { VolumeOffIcon, VolumeOnIcon } from './icons'

/** Looping teaser behind a title page's hero, with a mute toggle. */
export function TitlePreview({ preview }: { preview: PreviewClip }) {
  const allowed = usePreviewsAllowed()
  const [muted, setMuted] = useState(true)
  if (!allowed) return null

  return (
    <>
      <HeroPreview preview={preview} muted={muted} />
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute preview' : 'Mute preview'}
        className="absolute right-4 top-20 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition hover:bg-white/20 md:bottom-16 md:right-10 md:top-auto"
      >
        {muted ? <VolumeOffIcon className="size-5" /> : <VolumeOnIcon className="size-5" />}
      </button>
    </>
  )
}
