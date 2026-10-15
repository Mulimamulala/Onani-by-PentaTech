import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal-page'
import { COMPANY, MIN_AGE } from '@/lib/legal'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms are an agreement between you and ${COMPANY.legalName} ("PentaTech", "we") for your use of Onani.`}
    >
      <section>
        <h2>1. Who can use Onani</h2>
        <p>
          You must be at least {MIN_AGE} years old to create an account and buy a plan. Younger viewers may watch only
          with the permission and supervision of a parent or guardian who holds the account. You are responsible for
          everything that happens on your account and for keeping your sign-in email secure.
        </p>
      </section>
      <section>
        <h2>2. Plans and payment</h2>
        <ul>
          <li>Plans give access to the catalog for the period shown at purchase (for example 7 or 30 days).</li>
          <li>Prices are in Zambian Kwacha and include any applicable taxes unless stated otherwise.</li>
          <li>Payment is taken through our payment partners (mobile money or card). We do not store card numbers or mobile money PINs.</li>
          <li>Plans do not renew automatically unless you choose that option at checkout. [Confirm renewal model.]</li>
        </ul>
      </section>
      <section>
        <h2>3. Refunds</h2>
        <p>[Refund policy, e.g. refunds within 48 hours if nothing has been watched, or where required by the Competition and Consumer Protection Act.]</p>
      </section>
      <section>
        <h2>4. Your use of the content</h2>
        <ul>
          <li>Content is licensed to you for personal, non-commercial viewing only. You do not own it.</li>
          <li>You must not record, copy, download, re-stream, share or publicly show content, or try to get around protections such as watermarks or playback limits.</li>
          <li>[Device and sharing limits, e.g. one account per household and up to two screens at once.]</li>
          <li>Recordings found outside Onani may be traced to the account they came from.</li>
        </ul>
      </section>
      <section>
        <h2>5. Availability</h2>
        <p>
          The catalog changes over time, and titles may be added or removed. Playback quality depends on your device and
          connection. We may suspend the service for maintenance and will try to give notice of planned downtime.
        </p>
      </section>
      <section>
        <h2>6. Ending your account</h2>
        <p>
          You can stop using Onani at any time. We may suspend or close accounts that break these terms, for example by
          sharing or recording content. [Notice and appeal process.]
        </p>
      </section>
      <section>
        <h2>7. Liability</h2>
        <p>
          Onani is provided as available. To the extent the law allows, PentaTech is not liable for indirect losses.
          Nothing in these terms limits rights you have under Zambian consumer protection law.
        </p>
      </section>
      <section>
        <h2>8. Changes and law</h2>
        <p>
          If we change these terms we will ask you to accept the new version before you continue. These terms are governed
          by the laws of the Republic of Zambia. Questions: {COMPANY.supportEmail}. {COMPANY.legalName},{' '}
          {COMPANY.registration}, {COMPANY.address}.
        </p>
        <p className="mt-2">
          See also our <Link href="/privacy" className="font-semibold text-ink underline">Privacy Policy</Link> and{' '}
          <Link href="/cookies" className="font-semibold text-ink underline">Cookie Policy</Link>.
        </p>
      </section>
    </LegalPage>
  )
}
