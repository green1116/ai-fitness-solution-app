/**
 * V59.4 — Stripe SDK client singleton
 */

import Stripe from "stripe";

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!cached) {
    cached = new Stripe(secretKey);
  }
  return cached;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

/** @deprecated Use getStripeInstance — kept for V59 SaaS core compat */
export function getStripeClient() {
  if (!isStripeConfigured()) {
    return createLegacyMockClient();
  }
  const stripe = getStripeInstance();
  return {
    async createCustomer(input: { email: string; organizationId: string }) {
      const customer = await stripe.customers.create({
        email: input.email,
        metadata: { organizationId: input.organizationId },
      });
      return { customerId: customer.id };
    },
    async createSubscription(input: { customerId: string; plan: string }) {
      const { resolveStripePriceId } = await import("./stripe.prices");
      const sub = await stripe.subscriptions.create({
        customer: input.customerId,
        items: [{ price: resolveStripePriceId(input.plan as "BASIC" | "PRO" | "ENTERPRISE", "month") }],
      });
      return { subscriptionId: sub.id };
    },
    async createCheckoutSession(input: {
      customerId: string;
      plan: string;
      successUrl: string;
      cancelUrl: string;
    }) {
      const { createCheckoutSession } = await import("./stripe.checkout");
      const result = await createCheckoutSession({
        organizationId: input.customerId,
        customerEmail: "",
        plan: input.plan as "BASIC" | "PRO" | "ENTERPRISE",
        interval: "month",
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        stripeCustomerId: input.customerId,
      });
      return {
        mode: "live" as const,
        customerId: input.customerId,
        checkoutUrl: result.url,
      };
    },
  };
}

function createLegacyMockClient() {
  return {
    async createCustomer(input: { email: string; organizationId: string }) {
      return { customerId: `mock_cus_${input.organizationId.slice(0, 12)}` };
    },
    async createSubscription(input: { customerId: string; plan: string }) {
      return { subscriptionId: `mock_sub_${input.plan.toLowerCase()}_${Date.now()}` };
    },
    async createCheckoutSession(input: {
      customerId: string;
      plan: string;
      successUrl: string;
      cancelUrl: string;
    }) {
      return {
        mode: "mock" as const,
        customerId: input.customerId,
        checkoutUrl: `${input.successUrl}?mock_checkout=1&plan=${input.plan}`,
      };
    },
  };
}

export function isStripeLive(): boolean {
  return isStripeConfigured();
}
