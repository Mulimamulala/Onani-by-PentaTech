'use server'

import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function saveProgress(videoId: string, positionSeconds: number, completed: boolean) {
  const user = await getCurrentUser()
  if (!user) return
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return

  // RLS ensures users can only write their own rows.
  const supabase = await createClient()
  await supabase.from('watch_progress').upsert({
    user_id: user.id,
    video_id: videoId,
    position_seconds: Math.floor(positionSeconds),
    completed,
  })
}
