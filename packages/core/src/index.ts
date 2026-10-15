// Platform-agnostic logic shared by web now and the Expo app later.
// Keep this free of Next.js, React DOM and Node-only imports.

export type SubscriptionLike = {
  status: 'pending' | 'active' | 'cancelled' | 'expired'
  current_period_end: string | null
}

/** A subscription grants access while it is active and its period has not ended. */
export function isSubscriptionActive(sub: SubscriptionLike, now: Date = new Date()): boolean {
  if (sub.status !== 'active') return false
  if (!sub.current_period_end) return false
  return new Date(sub.current_period_end).getTime() > now.getTime()
}

export function canWatch(opts: { titleIsFree: boolean; subscriptions: SubscriptionLike[] }, now: Date = new Date()): boolean {
  return opts.titleIsFree || opts.subscriptions.some((s) => isSubscriptionActive(s, now))
}

/** 5400 → "1h 30m", 300 → "5m" */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return ''
  const minutes = Math.round(totalSeconds / 60)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/** 7500, 'ZMW' → "K75"; 7550 → "K75.50" */
export function formatPrice(minor: number, currency: string): string {
  const major = minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2)
  return currency === 'ZMW' ? `K${major}` : `${currency} ${major}`
}

/** "S1 · E3" for episodes, empty for movies. */
export function episodeLabel(season: number | null, episode: number | null): string {
  if (season == null || episode == null) return ''
  return `S${season} · E${episode}`
}

/** How far through a video someone is, 0–1. */
export function progressFraction(position: number, duration: number | null | undefined): number {
  if (!duration || duration <= 0) return 0
  return Math.min(1, Math.max(0, position / duration))
}
