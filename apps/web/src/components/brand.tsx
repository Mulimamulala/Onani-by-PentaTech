import Link from 'next/link'

/** The Onani wordmark: the name is the brand, no symbol. */
export function Wordmark({ className = 'text-[22px]' }: { className?: string }) {
  return <span className={`font-bold leading-none tracking-[-0.06em] ${className}`}>onani</span>
}

export function OnaniLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Onani home" className={`inline-flex items-center ${className}`}>
      <Wordmark />
    </Link>
  )
}

/** Large decorative pentagons used behind heroes and empty posters. */
export function PentagonField({ className = '' }: { className?: string }) {
  const pentagon = 'M50 4 95.1 36.8 77.9 89.8H22.1L4.9 36.8Z'
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className} fill="none">
      <path d={pentagon} stroke="var(--ink)" strokeOpacity="0.14" strokeWidth="0.5" />
      <path d={pentagon} stroke="var(--ink)" strokeOpacity="0.09" strokeWidth="0.5" transform="translate(50 50) scale(0.72) translate(-50 -50)" />
      <path d={pentagon} stroke="var(--ink)" strokeOpacity="0.05" strokeWidth="0.5" transform="translate(50 50) scale(0.44) translate(-50 -50)" />
    </svg>
  )
}
