/**
 * V59.4 — Stripe webhook handler (signature verification + idempotency)
 */

import type Stripe from "stripe";

import { processPaymentEvent } from "@/lib/billing/payment/payment.processor";
import { saasDb } from "@/lib/saas/types";

import { getStripeInstance, getStripeWebhookSecret, isStripeConfigured } from "./stripe.client";

export type WebhookHandleResult = {
  received: boolean;
  duplicate?: boolean;
  processed?: Awaited<ReturnType<typeof processPaymentEvent>>;
};

export function constructStripeEvent(payload: string | Buffer, signature: string): Stripe.Event {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }
  const stripe = getStripeInstance();
  return stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
}

export async function isWebhookEventProcessed(stripeEventId: string): Promise<boolean> {
  return saasDb().stripeWebhookEvent.exists(stripeEventId);
}

export async function markWebhookEventProcessed(stripeEventId: string, eventType: string) {
  return saasDb().stripeWebhookEvent.create({
    data: { stripeEventId, eventType },
  });
}

export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string | null,
): Promise<WebhookHandleResult> {
  if (!signature) {
    throw new Error("Missing Stripe signature header");
  }

  const event = constructStripeEvent(payload, signature);

  if (await isWebhookEventProcessed(event.id)) {
    return { received: true, duplicate: true };
  }

  const processed = await processPaymentEvent(event);
  await markWebhookEventProcessed(event.id, event.type);

  return { received: true, duplicate: false, processed };
}

/** Dev-only: process mock checkout without Stripe signature (never used from client routes directly) */
export async function handleMockCheckoutCompleted(input: {
  organizationId: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  sessionId: string;
}) {
  const mockEvent = {
    id: `mock_evt_${input.sessionId}`,
    type: "checkout.session.completed" as const,
    data: {
      object: {
        id: input.sessionId,
        metadata: { organizationId: input.organizationId, plan: input.plan },
        customer: `mock_cus_${input.organizationId.slice(0, 12)}`,
        subscription: `mock_sub_${input.plan.toLowerCase()}`,
        amount_total: 0,
        currency: "usd",
      },
    },
  } as unknown as Stripe.Event;

  if (await isWebhookEventProcessed(mockEvent.id)) {
    return { received: true, duplicate: true };
  }

  const processed = await processPaymentEvent(mockEvent);
  await markWebhookEventProcessed(mockEvent.id, mockEvent.type);
  return { received: true, duplicate: false, processed };
}
