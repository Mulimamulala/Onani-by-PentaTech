'use client'

import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
const KEY = 'onani-theme'

/** Runs before paint (inlined in <head>) so the saved theme never flashes. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
  try {
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  } catch {
    // Private mode or blocked storage: the choice lasts for this page only.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = document.documentElement.dataset.theme
    // Syncing with the theme the init script applied before hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-full bg-surface p-1 text-xs font-semibold">
      {(['system', 'light', 'dark'] as const).map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => {
            setTheme(t)
            apply(t)
          }}
          className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
            theme === t ? 'bg-bg text-ink shadow-sm ring-1 ring-hairline-soft' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
