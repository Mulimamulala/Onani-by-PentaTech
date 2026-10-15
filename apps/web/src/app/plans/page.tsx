import type { Metadata } from 'next'
import { formatPrice } from '@onani/core'
import { PentagonField } from '@/components/brand'
import { CheckIcon } from '@/components/icons'
import { getActivePlans } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Plans' }

const BENEFITS = ['Every film and series', 'Watch on phone, laptop and TV', 'HD where your connection allows', 'Cancel anytime']
const PAYMENT_METHODS = ['Airtel Money', 'MTN MoMo', 'Zamtel Kwacha', 'Visa', 'Mastercard']

export default async function PlansPage() {
  const plans = await getActivePlans()
  // The longest plan is usually the best value per day.
  const best = plans.reduce<(typeof plans)[number] | null>((a, p) => (!a || p.period_days > a.period_days ? p : a), null)

  return (
    <div className="relative isolate overflow-hidden">
      <PentagonField className="absolute -right-[30%] -top-[10%] -z-10 w-[120%] opacity-60 md:-right-[10%] md:w-[55%]" />

      <div className="mx-auto max-w-5xl px-4 pt-24 md:px-10 md:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Plans</p>
        <h1 className="mt-2 max-w-2xl text-[40px] font-bold leading-[1.02] tracking-[-0.04em] md:text-6xl">
          One plan. Everything on Onani.
        </h1>
        <p className="mt-4 max-w-xl text-ink-2 md:text-lg">No contracts and no card required. Pay with mobile money and watch straight away.</p>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const highlight = plan.id === best?.id && plans.length > 1
            const perDay = formatPrice(Math.round(plan.price_minor / plan.period_days), plan.currency)
            return (
              <li
                key={plan.id}
                className={`relative flex flex-col rounded-[24px] p-6 md:p-8 ${
                  highlight ? 'bg-surface ring-2 ring-gold' : 'bg-surface ring-1 ring-hairline-soft'
                }`}
              >
                {highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-ink">
                    Best value
                  </span>
                )}
                <h2 className="text-xl font-bold tracking-[-0.02em]">{plan.name}</h2>
                {plan.description && <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>}
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-[-0.04em]">{formatPrice(plan.price_minor, plan.currency)}</span>
                  <span className="text-ink-muted">/ {plan.period_days} days</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">About {perDay} a day</p>

                <ul className="mt-6 space-y-3 text-[15px] text-ink-2">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <CheckIcon className="size-4 shrink-0 text-gold" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* TODO: start a Flutterwave/DPO checkout and activate the subscription from its webhook. */}
                <button
                  disabled
                  className={`mt-8 w-full rounded-full px-6 py-4 font-bold disabled:cursor-not-allowed ${
                    highlight ? 'bg-gold text-gold-ink opacity-70' : 'bg-surface-2 text-ink opacity-70'
                  }`}
                >
                  Payments opening soon
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-10 rounded-[18px] bg-surface p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Pay with</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <li key={m} className="rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-semibold text-ink-2">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
