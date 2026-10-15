import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { episodeLabel, formatDuration } from '@onani/core'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteVideo } from '../../actions'
import { TitleForm } from '../../title-form'
import { VideoUploader } from './video-uploader'

const STATUS_STYLES = {
  waiting_upload: 'bg-surface-2 text-muted',
  processing: 'bg-yellow-500/15 text-yellow-400',
  ready: 'bg-green-500/15 text-green-400',
  errored: 'bg-red-500/15 text-red-400',
} as const

export default function AdminTitlePage({ params }: PageProps<'/admin/titles/[id]'>) {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 pb-10 pt-24 sm:px-8">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">← All titles</Link>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <EditTitle params={params} />
      </Suspense>
    </div>
  )
}

async function EditTitle({ params }: { params: PageProps<'/admin/titles/[id]'>['params'] }) {
  await requireAdmin()
  const { id } = await params

  const supabase = await createClient()
  const { data: title } = await supabase
    .from('titles')
    .select('*, videos (*)')
    .eq('id', id)
    .order('season_number', { referencedTable: 'videos', nullsFirst: true })
    .order('episode_number', { referencedTable: 'videos', nullsFirst: true })
    .maybeSingle()
  if (!title) notFound()

  const { videos, ...titleFields } = title

  return (
    <>
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-3xl font-bold tracking-[-0.03em]">{title.name}</h1>
          {title.published_at && (
            <Link href={`/title/${title.slug}`} className="text-sm text-accent">View on site →</Link>
          )}
        </div>
        <TitleForm title={titleFields} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Videos</h2>
        {videos.length > 0 && (
          <ul className="mb-6 divide-y divide-border rounded-[18px] border border-border">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center gap-4 p-4">
                <span className="w-16 text-sm text-muted">{episodeLabel(v.season_number, v.episode_number)}</span>
                <span className="flex-1">{v.name}</span>
                <span className="text-sm text-muted">{formatDuration(v.duration_seconds)}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[v.status]}`}>{v.status.replace('_', ' ')}</span>
                {v.status === 'ready' && (
                  <Link href={`/watch/${v.id}`} className="text-sm text-accent">Play</Link>
                )}
                <form action={deleteVideo}>
                  <input type="hidden" name="id" value={v.id} />
                  <button className="text-sm text-red-400 hover:underline">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <VideoUploader titleId={title.id} isSeries={title.kind === 'series'} />
      </section>
    </>
  )
}
