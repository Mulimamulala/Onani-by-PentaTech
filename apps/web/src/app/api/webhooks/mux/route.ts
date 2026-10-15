import { revalidateTag } from 'next/cache'
import { CATALOG_TAG } from '@/lib/catalog'
import { mux, pickCoverTime } from '@/lib/mux'
import { createAdminClient } from '@/lib/supabase/server'

// Mux → Onani. Configure in Mux: Settings → Webhooks → https://<site>/api/webhooks/mux
export async function POST(request: Request) {
  const body = await request.text()

  let event
  try {
    // Verifies the mux-signature header against MUX_WEBHOOK_SECRET.
    event = await mux.webhooks.unwrap(body, request.headers)
  } catch {
    return new Response('Invalid signature', { status: 401 })
  }

  const db = createAdminClient()

  switch (event.type) {
    case 'video.upload.asset_created': {
      await db
        .from('videos')
        .update({ mux_asset_id: event.data.asset_id ?? null, status: 'processing' })
        .eq('mux_upload_id', event.data.id)
      break
    }
    case 'video.asset.ready': {
      const asset = event.data
      const playbackId = asset.playback_ids?.find((p) => p.policy === 'signed')?.id ?? null
      const videoId = asset.passthrough
      if (!videoId) break
      const coverTime = playbackId ? await pickCoverTime(playbackId, asset.duration ?? null) : null
      await db
        .from('videos')
        .update({
          mux_asset_id: asset.id,
          mux_playback_id: playbackId,
          duration_seconds: asset.duration ?? null,
          cover_time_seconds: coverTime,
          status: 'ready',
        })
        .eq('id', videoId)
      revalidateTag(CATALOG_TAG, 'max')
      break
    }
    case 'video.asset.errored': {
      if (event.data.passthrough) {
        await db.from('videos').update({ status: 'errored' }).eq('id', event.data.passthrough)
      }
      break
    }
  }

  return Response.json({ received: true })
}
