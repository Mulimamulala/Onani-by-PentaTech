import type { Metadata } from 'next'
import { formatPrice } from '@onani/core'
import { getActivePlans } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Plans' }

export default async function PlansPage() {
  const plans = await getActivePlans()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <h1 className="text-3xl font-bold">Choose your plan</h1>
      <p className="mt-2 text-muted">Pay with Airtel Money, MTN MoMo, Zamtel Kwacha or card. Cancel anytime.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            {plan.description && <p className="mt-1 text-sm text-muted">{plan.description}</p>}
            <p className="mt-6 text-3xl font-bold">
              {formatPrice(plan.price_minor, plan.currency)}
              <span className="text-base font-normal text-muted"> / {plan.period_days} days</span>
            </p>
            {/* TODO: start a Flutterwave/DPO checkout and activate the subscription from its webhook. */}
            <button
              disabled
              className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 font-semibold text-accent-foreground opacity-60"
            >
              Payments coming soon
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
