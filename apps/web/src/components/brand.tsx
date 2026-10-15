import Link from 'next/link'

/** The Onani mark: the PentaTech pentagon carrying a play triangle. */
export function OnaniMark({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <polygon
        points="16,3 28.4,12 23.7,26.6 8.3,26.6 3.6,12"
        fill="var(--gold)"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M13.2 11.2v9.6l8-4.8-8-4.8Z" fill="var(--gold-ink)" />
    </svg>
  )
}

export function OnaniLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Onani home" className={`inline-flex items-center gap-2 ${className}`}>
      <OnaniMark />
      <span className="text-[22px] font-bold leading-none tracking-[-0.06em]">onani</span>
    </Link>
  )
}

/** Large decorative pentagons used behind heroes and empty posters. */
export function PentagonField({ className = '' }: { className?: string }) {
  const pentagon = 'M50 4 95.1 36.8 77.9 89.8H22.1L4.9 36.8Z'
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className} fill="none">
      <path d={pentagon} stroke="var(--gold)" strokeOpacity="0.35" strokeWidth="0.6" />
      <path d={pentagon} stroke="var(--gold)" strokeOpacity="0.18" strokeWidth="0.6" transform="translate(50 50) scale(0.72) translate(-50 -50)" />
      <path d={pentagon} stroke="var(--gold)" strokeOpacity="0.1" strokeWidth="0.6" transform="translate(50 50) scale(0.44) translate(-50 -50)" />
    </svg>
  )
}
