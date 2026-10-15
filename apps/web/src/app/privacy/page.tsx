import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'
import { COMPANY } from '@/lib/legal'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`How ${COMPANY.legalName} collects and uses personal data on Onani, in line with Zambia's Data Protection Act No. 3 of 2021.`}
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong className="text-ink">Account:</strong> your email address and display name.</li>
          <li><strong className="text-ink">Viewing:</strong> what you watch and where you stopped, so you can continue watching.</li>
          <li><strong className="text-ink">Payments:</strong> plan, amount, status and a reference from our payment partner. We do not receive card numbers or PINs.</li>
          <li><strong className="text-ink">Consents:</strong> which version of these policies you accepted and when.</li>
          <li><strong className="text-ink">Playback quality (only if you allow analytics cookies):</strong> buffering, errors and device type.</li>
        </ul>
      </section>
      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To provide the service you signed up for (contract).</li>
          <li>To keep accounts and content secure, including watermarking playback with your account email (legitimate interest).</li>
          <li>To improve streaming quality, only with your consent.</li>
          <li>To meet legal and tax obligations.</li>
        </ul>
      </section>
      <section>
        <h2>Who processes it</h2>
        <p>We use these providers, which store data outside Zambia under contracts that protect it:</p>
        <ul>
          <li>Supabase (accounts and database), European Union (Ireland).</li>
          <li>Mux (video delivery and playback analytics), United States.</li>
          <li>Vercel (website hosting), United States.</li>
          <li>[Payment partner, e.g. Flutterwave or DPO].</li>
        </ul>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>[Retention periods, e.g. account data while your account is open plus 12 months; payment records for 7 years as tax law requires.]</p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          You can ask to see, correct or delete your data, object to its use, or withdraw consent at any time. Email{' '}
          {COMPANY.privacyEmail}. You may also complain to the Office of the Data Protection Commissioner of Zambia.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          {COMPANY.legalName}, {COMPANY.registration}, {COMPANY.address}. Data protection contact: {COMPANY.privacyEmail}.
        </p>
      </section>
    </LegalPage>
  )
}
