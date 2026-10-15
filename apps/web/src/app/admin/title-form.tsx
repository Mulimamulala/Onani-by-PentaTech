'use client'

import { useActionState } from 'react'
import type { Title } from '@onani/db'
import { saveTitle, type FormState } from './actions'

const input = 'w-full rounded-[14px] border border-border bg-surface px-3 py-2 outline-none focus:border-accent'

export function TitleForm({ title }: { title?: Title }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTitle, {})

  return (
    <form action={action} className="grid gap-4 rounded-[18px] border border-border p-5 sm:grid-cols-2">
      {title && <input type="hidden" name="id" value={title.id} />}

      <Field label="Name">
        <input name="name" required defaultValue={title?.name} className={input} />
      </Field>
      <Field label="Slug (optional)">
        <input name="slug" defaultValue={title?.slug} placeholder="auto from name" className={input} />
      </Field>
      <Field label="Type">
        <select name="kind" defaultValue={title?.kind ?? 'movie'} className={input}>
          <option value="movie">Film</option>
          <option value="series">Series</option>
        </select>
      </Field>
      <Field label="Release year">
        <input name="release_year" type="number" defaultValue={title?.release_year ?? undefined} className={input} />
      </Field>
      <Field label="Genres (comma separated)">
        <input name="genres" defaultValue={title?.genres.join(', ')} className={input} />
      </Field>
      <Field label="Maturity rating">
        <input name="maturity_rating" defaultValue={title?.maturity_rating ?? undefined} placeholder="PG, 13+, 18+" className={input} />
      </Field>
      <Field label="Poster URL (2:3)">
        <input name="poster_url" type="url" defaultValue={title?.poster_url ?? undefined} className={input} />
      </Field>
      <Field label="Backdrop URL (16:9)">
        <input name="backdrop_url" type="url" defaultValue={title?.backdrop_url ?? undefined} className={input} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Synopsis">
          <textarea name="synopsis" rows={3} defaultValue={title?.synopsis ?? undefined} className={input} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6 text-sm sm:col-span-2">
        <Check name="published" label="Published" defaultChecked={Boolean(title?.published_at)} />
        <Check name="is_free" label="Free to watch" defaultChecked={title?.is_free} />
        <Check name="is_featured" label="Featured on home" defaultChecked={title?.is_featured} />
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="rounded-[14px] bg-accent px-5 py-2 font-semibold text-accent-foreground disabled:opacity-60">
          {pending ? 'Saving…' : title ? 'Save changes' : 'Create title'}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  )
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-[var(--accent)]" />
      {label}
    </label>
  )
}
