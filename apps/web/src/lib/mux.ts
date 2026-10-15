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
    expiration: '6h',
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

/** A representative frame: a fifth of the way in, capped at one minute. */
export function frameTime(durationSeconds: number | null | undefined): number {
  if (!durationSeconds || durationSeconds <= 0) return 0
  return Math.min(60, durationSeconds * 0.2)
}
