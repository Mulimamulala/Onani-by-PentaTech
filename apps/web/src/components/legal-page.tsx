import Link from 'next/link'
import type { ReactNode } from 'react'
import { LEGAL_IS_DRAFT, LEGAL_VERSION } from '@/lib/legal'

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-10 md:pt-32">
      {LEGAL_IS_DRAFT && (
        <p className="mb-8 rounded-[14px] bg-surface p-4 text-sm text-ink-2 ring-1 ring-hairline-soft">
          <strong className="text-ink">Draft.</strong> This text is a placeholder and has not been reviewed by a lawyer.
          Items in [brackets] still need real details.
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Version {LEGAL_VERSION}</p>
      <h1 className="mt-2 text-[clamp(2.25rem,min(8vw,11svh),3.75rem)] font-bold leading-[1.02] tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 text-lg text-ink-2">{intro}</p>
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <nav aria-label="Legal" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline-soft pt-6 text-sm font-semibold text-ink-muted">
        <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
        <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
        <Link href="/cookies" className="hover:text-ink">Cookie Policy</Link>
      </nav>
    </article>
  )
}
