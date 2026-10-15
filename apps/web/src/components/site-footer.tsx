import Link from 'next/link'
import { OnaniLogo } from './brand'
import { ThemeToggle } from './theme-toggle'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline-soft">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-10">
        <div className="space-y-3">
          <OnaniLogo />
          <p className="max-w-xs text-sm text-ink-muted">Films and series, streaming anywhere. Pay with mobile money.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-ink-2">
          <Link href="/browse?type=movie" className="hover:text-ink">Films</Link>
          <Link href="/plans" className="hover:text-ink">Plans</Link>
          <Link href="/browse?type=series" className="hover:text-ink">Series</Link>
          <Link href="/account" className="hover:text-ink">Account</Link>
          <Link href="/browse?free=1" className="hover:text-ink">Watch free</Link>
        </nav>
        <div className="flex flex-col gap-4 md:items-end">
          <ThemeToggle />
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            A product of
            {/* The wordmark PNG is used as a mask so it takes the text colour in both themes. */}
            <span
              role="img"
              aria-label="PentaTech"
              className="block h-[11px] w-[120px] bg-ink-muted"
              style={{
                maskImage: 'url(/brand/pentatech-white.png)',
                WebkitMaskImage: 'url(/brand/pentatech-white.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
