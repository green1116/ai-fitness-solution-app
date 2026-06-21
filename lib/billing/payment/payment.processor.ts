/**
 * V59.4 — Stripe payment event processor (server-side only)
 */

import type Stripe from "stripe";

import { markPaymentPaid, recordCheckoutPayment } from "@/lib/billing/payment/payment.service";
import { isHandledWebhookEvent } from "@/lib/billing/payment/payment.events";
import {
  cancelSubscriptionByStripeId,
  syncStripeCustomer,
  updateSubscriptionStatus,
} from "@/lib/billing/subscription/subscription.updater";
import { metadataPlanToSaasPlan } from "@/lib/billing/stripe/stripe.products";
import { mapStripePlanToFeatureFlags } from "@/lib/billing/subscription/subscription.resolver";
import type { SaasPlan } from "@/lib/saas/types";

export type PaymentProcessResult = {
  handled: boolean;
  eventType: string;
  organizationId?: string;
  plan?: SaasPlan;
  featureFlags?: ReturnType<typeof mapStripePlanToFeatureFlags>;
};

function resolveOrgId(metadata: Stripe.Metadata | null | undefined): string | null {
  return metadata?.organizationId ?? null;
}

function resolvePlan(metadata: Stripe.Metadata | null | undefined): SaasPlan | null {
  return metadataPlanToSaasPlan(metadata?.plan ?? metadata?.productKey ?? null);
}

export async function processPaymentEvent(event: Stripe.Event): Promise<PaymentProcessResult> {
  if (!isHandledWebhookEvent(event.type)) {
    return { handled: false, eventType: event.type };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = resolveOrgId(session.metadata);
      const plan = resolvePlan(session.metadata) ?? "BASIC";

      if (!organizationId || !session.id) {
        return { handled: false, eventType: event.type };
      }

      await recordCheckoutPayment({
        organizationId,
        stripeSessionId: session.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        plan,
      });

      if (session.customer && typeof session.customer === "string") {
        await syncStripeCustomer({
          organizationId,
          stripeCustomerId: session.customer,
        });
      }

      if (session.subscription && typeof session.subscription === "string") {
        await updateSubscriptionStatus({
          organizationId,
          plan,
          status: "ACTIVE",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId: session.subscription,
        });
      }

      await markPaymentPaid(session.id);

      return {
        handled: true,
        eventType: event.type,
        organizationId,
        plan,
        featureFlags: mapStripePlanToFeatureFlags(plan),
      };
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string | null };
      const organizationId =
        resolveOrgId(invoice.metadata) ??
        (typeof invoice.customer === "string"
          ? await lookupOrgByCustomer(invoice.customer)
          : null);

      if (!organizationId) {
        return { handled: true, eventType: event.type };
      }

      const subId =
        typeof invoiceWithSub.subscription === "string" ? invoiceWithSub.subscription : undefined;

      if (subId) {
        const plan = resolvePlan(invoice.metadata) ?? "PRO";
        await updateSubscriptionStatus({
          organizationId,
          plan,
          status: "ACTIVE",
          stripeSubscriptionId: subId,
          currentPeriodEnd: invoice.lines?.data[0]?.period?.end
            ? new Date(invoice.lines.data[0].period.end * 1000)
            : undefined,
        });
      }

      return {
        handled: true,
        eventType: event.type,
        organizationId,
        featureFlags: mapStripePlanToFeatureFlags(resolvePlan(invoice.metadata) ?? "PRO"),
      };
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription & { current_period_end?: number };
      const organizationId =
        resolveOrgId(sub.metadata) ??
        (typeof sub.customer === "string" ? await lookupOrgByCustomer(sub.customer) : null);
      const plan = resolvePlan(sub.metadata);

      if (!organizationId) {
        return { handled: true, eventType: event.type };
      }

      const status = sub.status === "active" || sub.status === "trialing" ? "ACTIVE" : "CANCELED";

      await updateSubscriptionStatus({
        organizationId,
        plan: plan ?? "BASIC",
        status,
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : undefined,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : undefined,
      });

      return {
        handled: true,
        eventType: event.type,
        organizationId,
        plan: plan ?? undefined,
        featureFlags: plan ? mapStripePlanToFeatureFlags(plan) : undefined,
      };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await cancelSubscriptionByStripeId(sub.id);
      const organizationId = resolveOrgId(sub.metadata);
      return {
        handled: true,
        eventType: event.type,
        organizationId: organizationId ?? undefined,
        featureFlags: mapStripePlanToFeatureFlags("BASIC"),
      };
    }

    default:
      return { handled: false, eventType: event.type };
  }
}

async function lookupOrgByCustomer(stripeCustomerId: string): Promise<string | null> {
  const sub = await import("@/lib/billing/subscription/subscription.resolver").then((m) =>
    m.findSubscriptionByStripeCustomerId(stripeCustomerId),
  );
  return sub?.organizationId ?? null;
}
