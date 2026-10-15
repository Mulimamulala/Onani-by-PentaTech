import type { Metadata } from 'next'
import { CookieChoice } from '@/components/cookie-choice'
import { LegalPage } from '@/components/legal-page'
import { CONSENT_COOKIE } from '@/lib/legal'

export const metadata: Metadata = { title: 'Cookie Policy' }

const ROWS = [
  { name: 'sb-…-auth-token', type: 'Essential', purpose: 'Keeps you signed in.', lasts: 'Until you sign out' },
  { name: CONSENT_COOKIE, type: 'Essential', purpose: 'Remembers your cookie choice.', lasts: '12 months' },
  { name: 'onani-theme (local storage)', type: 'Essential', purpose: 'Remembers Light or Dark mode.', lasts: 'Until cleared' },
  { name: 'muxData', type: 'Analytics', purpose: 'Measures playback quality (buffering, errors). Only set if you allow analytics.', lasts: 'Up to 20 years [confirm]' },
]

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Onani uses a small number of cookies. Essential ones keep the site working; analytics ones are off unless you turn them on."
    >
      <section>
        <h2>Your choice</h2>
        <CookieChoice />
      </section>
      <section>
        <h2>What we use</h2>
        <div className="overflow-x-auto rounded-[14px] ring-1 ring-hairline-soft">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface text-ink">
              <tr>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Purpose</th>
                <th className="p-3 font-semibold">Lasts</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name} className="border-t border-hairline-soft align-top">
                  <td className="p-3 font-mono text-xs text-ink">{r.name}</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.purpose}</td>
                  <td className="p-3">{r.lasts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>No advertising cookies</h2>
        <p>Onani does not use advertising or cross-site tracking cookies.</p>
      </section>
    </LegalPage>
  )
}
