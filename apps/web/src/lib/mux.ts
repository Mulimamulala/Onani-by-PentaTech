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

/** Poster image for a signed playback ID. */
export async function signedThumbnailUrl(playbackId: string, width = 640): Promise<string> {
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'thumbnail',
    expiration: '1d',
    params: { width: String(width) },
  })
  return `https://image.mux.com/${playbackId}/thumbnail.webp?token=${token}`
}
