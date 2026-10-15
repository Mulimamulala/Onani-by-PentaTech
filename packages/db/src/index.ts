export type { Database, Json } from './database.types'
import type { Database } from './database.types'

type PublicTables = Database['public']['Tables']

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row']
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]['Insert']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type Title = Tables<'titles'>
export type Video = Tables<'videos'>
export type Plan = Tables<'plans'>
export type Subscription = Tables<'subscriptions'>
export type WatchProgress = Tables<'watch_progress'>
