import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TitleForm } from './title-form'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 pb-10 pt-24 sm:px-8">
      <h1 className="text-3xl font-bold tracking-[-0.03em]">Admin</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  )
}

async function Dashboard() {
  await requireAdmin()
  const supabase = await createClient()
  const { data: titles } = await supabase
    .from('titles')
    .select('id, slug, name, kind, published_at, videos (id, status)')
    .order('created_at', { ascending: false })

  return (
    <>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Titles</h2>
        {titles && titles.length > 0 ? (
          <ul className="divide-y divide-border rounded-[18px] border border-border">
            {titles.map((t) => {
              const ready = t.videos.filter((v) => v.status === 'ready').length
              return (
                <li key={t.id}>
                  <Link href={`/admin/titles/${t.id}`} className="flex items-center gap-4 p-4 hover:bg-surface">
                    <span className="flex-1 font-medium">{t.name}</span>
                    <span className="text-sm text-muted">{t.kind}</span>
                    <span className="text-sm text-muted">{ready}/{t.videos.length} videos ready</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${t.published_at ? 'bg-green-500/15 text-green-400' : 'bg-surface-2 text-muted'}`}>
                      {t.published_at ? 'Published' : 'Draft'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted">No titles yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">New title</h2>
        <TitleForm />
      </section>
    </>
  )
}
