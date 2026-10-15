'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { CATALOG_TAG } from '@/lib/catalog'
import { mux } from '@/lib/mux'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error?: string }

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? '').trim()
  return value === '' ? null : value
}

function int(formData: FormData, key: string): number | null {
  const value = text(formData, key)
  if (value === null) return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

/** Images go through next/image, so only hosts allowed in next.config.ts work. */
function imageUrl(formData: FormData, key: string): string | null {
  const value = text(formData, key)
  if (value === null) return null
  try {
    const url = new URL(value)
    const ok = url.protocol === 'https:' && (url.hostname.endsWith('.supabase.co') || url.hostname === 'image.mux.com')
    if (!ok) throw new Error()
    return value
  } catch {
    throw new Error(`${key.replace('_', ' ')} must be an https URL on Supabase Storage or Mux.`)
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function saveTitle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const name = text(formData, 'name')
  if (!name) return { error: 'Name is required.' }

  let poster_url: string | null
  let backdrop_url: string | null
  try {
    poster_url = imageUrl(formData, 'poster_url')
    backdrop_url = imageUrl(formData, 'backdrop_url')
  } catch (e) {
    return { error: (e as Error).message }
  }

  const fields = {
    name,
    slug: slugify(text(formData, 'slug') ?? name),
    kind: formData.get('kind') === 'series' ? ('series' as const) : ('movie' as const),
    synopsis: text(formData, 'synopsis'),
    poster_url,
    backdrop_url,
    release_year: int(formData, 'release_year'),
    maturity_rating: text(formData, 'maturity_rating'),
    genres: (text(formData, 'genres') ?? '').split(',').map((g) => g.trim()).filter(Boolean),
    is_free: formData.get('is_free') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    published_at: formData.get('published') === 'on' ? new Date().toISOString() : null,
  }

  const supabase = await createClient()

  if (id) {
    // Keep the original publish date when a title stays published.
    const { data: existing } = await supabase.from('titles').select('published_at').eq('id', id).single()
    if (fields.published_at && existing?.published_at) fields.published_at = existing.published_at

    const { error } = await supabase.from('titles').update(fields).eq('id', id)
    if (error) return { error: error.message }
    updateTag(CATALOG_TAG)
    return {}
  }

  const { data, error } = await supabase.from('titles').insert(fields).select('id').single()
  if (error) return { error: error.code === '23505' ? 'That slug is already taken.' : error.message }
  updateTag(CATALOG_TAG)
  redirect(`/admin/titles/${data.id}`)
}

export type UploadState = { error?: string; uploadUrl?: string; videoId?: string }

/** Creates the video row plus a Mux direct upload; the browser then uploads straight to Mux. */
export async function createVideoUpload(_prev: UploadState, formData: FormData): Promise<UploadState> {
  await requireAdmin()

  const titleId = text(formData, 'title_id')
  const name = text(formData, 'name')
  if (!titleId || !name) return { error: 'Name is required.' }

  const supabase = await createClient()
  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      title_id: titleId,
      name,
      synopsis: text(formData, 'synopsis'),
      season_number: int(formData, 'season_number'),
      episode_number: int(formData, 'episode_number'),
    })
    .select('id')
    .single()
  if (error) return { error: error.code === '23505' ? 'That season/episode already exists.' : error.message }

  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    new_asset_settings: {
      playback_policies: ['signed'],
      // 'basic' quality has no encoding cost on Mux; switch to 'plus' for premium titles.
      video_quality: 'basic',
      passthrough: video.id,
    },
  })

  await supabase.from('videos').update({ mux_upload_id: upload.id }).eq('id', video.id)

  return { uploadUrl: upload.url, videoId: video.id }
}

export async function deleteVideo(formData: FormData) {
  await requireAdmin()
  const id = text(formData, 'id')
  if (!id) return

  const supabase = await createClient()
  const { data: video } = await supabase.from('videos').select('mux_asset_id').eq('id', id).single()
  if (video?.mux_asset_id) {
    await mux.video.assets.delete(video.mux_asset_id).catch(() => {})
  }
  await supabase.from('videos').delete().eq('id', id)
  updateTag(CATALOG_TAG)
}
