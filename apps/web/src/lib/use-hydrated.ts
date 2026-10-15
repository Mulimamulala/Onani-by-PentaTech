import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * false on the server and during hydration, true afterwards. Use it to keep
 * URL-dependent details out of the server markup when the prerendered shell
 * may have been built for a different URL than the one being viewed.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
