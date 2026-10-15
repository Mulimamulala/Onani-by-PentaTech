import Image from 'next/image'
import Link from 'next/link'
import type { Title } from '@onani/db'

type CardTitle = Pick<Title, 'slug' | 'name' | 'poster_url' | 'release_year' | 'is_free' | 'kind'>

export function TitleCard({ title }: { title: CardTitle }) {
  return (
    <Link href={`/title/${title.slug}`} className="group block w-36 shrink-0 sm:w-44">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-accent">
        {title.poster_url ? (
          <Image
            src={title.poster_url}
            alt=""
            fill
            sizes="(min-width: 640px) 176px, 144px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-surface-2 to-surface p-3 text-sm font-semibold">
            {title.name}
          </div>
        )}
        {title.is_free && (
          <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
            Free
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{title.name}</p>
      <p className="text-xs text-muted">
        {[title.release_year, title.kind === 'series' ? 'Series' : 'Film'].filter(Boolean).join(' · ')}
      </p>
    </Link>
  )
}

export function TitleRow({ heading, titles }: { heading: string; titles: CardTitle[] }) {
  if (titles.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="px-4 text-lg font-semibold sm:px-8">{heading}</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8">
        {titles.map((t) => (
          <TitleCard key={t.slug} title={t} />
        ))}
      </div>
    </section>
  )
}
