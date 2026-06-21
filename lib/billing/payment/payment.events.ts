/**
 * V59.4 — Stripe webhook event types
 */

export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

export type StripeWebhookEventType = (typeof STRIPE_WEBHOOK_EVENTS)[number];

export function isHandledWebhookEvent(type: string): type is StripeWebhookEventType {
  return (STRIPE_WEBHOOK_EVENTS as readonly string[]).includes(type);
}
