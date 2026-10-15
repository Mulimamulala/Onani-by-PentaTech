/**
 * Mux thumbnails are already resized and carry a signed token that changes,
 * so they skip Next's optimizer (and its monthly quota).
 */
export function isMuxImage(src: string | null | undefined): boolean {
  return Boolean(src?.startsWith('https://image.mux.com/'))
}
