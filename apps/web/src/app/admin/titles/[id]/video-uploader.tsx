'use client'

import MuxUploader from '@mux/mux-uploader-react'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { createVideoUpload, type UploadState } from '../../actions'

const input = 'w-full rounded-[14px] border border-border bg-surface px-3 py-2 outline-none focus:border-accent'

export function VideoUploader({ titleId, isSeries }: { titleId: string; isSeries: boolean }) {
  const router = useRouter()
  const [state, action, pending] = useActionState<UploadState, FormData>(createVideoUpload, {})
  const [done, setDone] = useState(false)

  if (state.uploadUrl) {
    return (
      <div className="space-y-3 rounded-[18px] border border-border p-5">
        <p className="text-sm text-muted">
          {done
            ? 'Upload complete. Mux is processing the video; its status turns "ready" in a minute or two (refresh to check).'
            : 'Pick the video file. Keep this tab open until the upload finishes.'}
        </p>
        <MuxUploader
          endpoint={state.uploadUrl}
          onSuccess={() => {
            setDone(true)
            router.refresh()
          }}
        />
      </div>
    )
  }

  return (
    <form action={action} className="grid gap-4 rounded-[18px] border border-border p-5 sm:grid-cols-2">
      <input type="hidden" name="title_id" value={titleId} />
      <label className="block space-y-1 text-sm sm:col-span-2">
        <span className="font-medium">{isSeries ? 'Episode name' : 'Video name'}</span>
        <input name="name" required placeholder={isSeries ? 'Pilot' : 'Feature'} className={input} />
      </label>
      {isSeries && (
        <>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Season</span>
            <input name="season_number" type="number" min={1} required defaultValue={1} className={input} />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Episode</span>
            <input name="episode_number" type="number" min={1} required className={input} />
          </label>
        </>
      )}
      <label className="block space-y-1 text-sm sm:col-span-2">
        <span className="font-medium">Synopsis (optional)</span>
        <textarea name="synopsis" rows={2} className={input} />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="rounded-[14px] bg-accent px-5 py-2 font-semibold text-accent-foreground disabled:opacity-60">
          {pending ? 'Preparing…' : 'Next: choose file'}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  )
}
