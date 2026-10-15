import 'server-only'
import Mux from '@mux/mux-node'

// Reads MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY and
// MUX_WEBHOOK_SECRET from the environment.
export const mux = new Mux()

export type PlaybackTokens = {
  playback: string
  thumbnail: string
  storyboard: string
}

/** Short-lived tokens for a signed playback ID. Only call after checking entitlement. */
export async function signPlayback(playbackId: string): Promise<PlaybackTokens> {
  const tokens = await mux.jwt.signPlaybackId(playbackId, {
    type: ['video', 'thumbnail', 'storyboard'],
    // Long enough for a feature film; short enough that a shared link soon dies.
    expiration: '4h',
  })
  return {
    playback: tokens['playback-token']!,
    thumbnail: tokens['thumbnail-token']!,
    storyboard: tokens['storyboard-token']!,
  }
}

/**
 * A still frame from a signed playback ID. With signed playback, the image
 * params live inside the token, so the URL carries only `?token=`.
 */
export async function signedThumbnailUrl(
  playbackId: string,
  opts: { width?: number; time?: number } = {},
): Promise<string> {
  const params: Record<string, string> = { width: String(opts.width ?? 1280) }
  if (opts.time != null) params.time = String(Math.max(0, Math.floor(opts.time)))
  const token = await mux.jwt.signPlaybackId(playbackId, { type: 'thumbnail', expiration: '2d', params })
  return `https://image.mux.com/${playbackId}/thumbnail.webp?token=${token}`
}

export type PreviewClip = { playbackId: string; token: string }

/**
 * A muted teaser for heroes. The clip range is sealed inside the token, so
 * this token can be public: it cannot stream anything outside those seconds.
 */
export async function signPreview(
  playbackId: string,
  durationSeconds: number | null,
  coverTime?: number | null,
  length = 15,
): Promise<PreviewClip> {
  const duration = durationSeconds ?? length
  const start = Math.max(0, Math.min(coverTime ?? frameTime(duration), duration - length))
  const end = Math.min(duration, start + length)
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '3d',
    params: { asset_start_time: String(Math.floor(start)), asset_end_time: String(Math.ceil(end)) },
  })
  return { playbackId, token }
}

/**
 * Picks the most detailed of several frames between 15% and 70% of the video.
 * A tiny JPEG of a black or blank frame compresses to almost nothing, so file
 * size is a cheap, dependency-free proxy for "something worth looking at".
 */
export async function pickCoverTime(playbackId: string, durationSeconds: number | null): Promise<number | null> {
  if (!durationSeconds || durationSeconds < 2) return null
  const times = [0.15, 0.25, 0.35, 0.45, 0.55, 0.7].map((f) => Math.floor(durationSeconds * f))
  const sizes = await Promise.all(
    times.map(async (time) => {
      try {
        const token = await mux.jwt.signPlaybackId(playbackId, {
          type: 'thumbnail',
          expiration: '10m',
          params: { time: String(time), width: '96' },
        })
        const res = await fetch(`https://image.mux.com/${playbackId}/thumbnail.jpg?token=${token}`)
        return res.ok ? (await res.arrayBuffer()).byteLength : 0
      } catch {
        return 0
      }
    }),
  )
  const best = sizes.indexOf(Math.max(...sizes))
  return sizes[best] > 0 ? times[best] : null
}

/** Fallback frame when no cover was chosen: a fifth of the way in, capped at one minute. */
export function frameTime(durationSeconds: number | null | undefined): number {
  if (!durationSeconds || durationSeconds <= 0) return 0
  return Math.min(60, durationSeconds * 0.2)
}
