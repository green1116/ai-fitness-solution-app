/**
 * V59.4 — Stripe Checkout Session
 */

import type { SaasPlan } from "@/lib/saas/types";

import { getStripeInstance, isStripeConfigured } from "./stripe.client";
import { planToProductKey } from "./stripe.products";
import { resolveStripePriceId, type BillingInterval } from "./stripe.prices";

function isPriceConfigured(plan: SaasPlan, interval: BillingInterval): boolean {
  try {
    resolveStripePriceId(plan, interval);
    return true;
  } catch {
    return false;
  }
}

export type CreateCheckoutSessionInput = {
  organizationId: string;
  customerEmail: string;
  plan: SaasPlan;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId?: string;
};

export type CheckoutSessionResult = {
  sessionId: string;
  url: string | null;
  mode: "live" | "mock";
  customerId: string;
};

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const useLive = isStripeConfigured() && isPriceConfigured(input.plan, input.interval);

  if (!useLive) {
    return {
      sessionId: `mock_cs_${input.organizationId.slice(0, 8)}_${Date.now()}`,
      url: `${input.successUrl}${input.successUrl.includes("?") ? "&" : "?"}mock_checkout=1&plan=${input.plan}&organizationId=${input.organizationId}`,
      mode: "mock",
      customerId: input.stripeCustomerId ?? `mock_cus_${input.organizationId.slice(0, 12)}`,
    };
  }

  const priceId = resolveStripePriceId(input.plan, input.interval);
  const productKey = planToProductKey(input.plan);

  const stripe = getStripeInstance();

  let customerId = input.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: input.customerEmail,
      metadata: {
        organizationId: input.organizationId,
        plan: input.plan,
      },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: {
      organizationId: input.organizationId,
      plan: input.plan,
      productKey,
      interval: input.interval,
    },
    subscription_data: {
      metadata: {
        organizationId: input.organizationId,
        plan: input.plan,
        productKey,
      },
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    mode: "live",
    customerId,
  };
}
