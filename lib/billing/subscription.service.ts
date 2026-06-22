/**
 * V59 SaaS — Subscription service
 */

import { getStripeClient } from "@/lib/billing/stripe.client";
import { saasDb, type SaasPlan, type SubscriptionRecord } from "@/lib/saas/types";

export type SubscriptionPlan = SaasPlan;

export async function createSubscription(input: {
  organizationId: string;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}): Promise<SubscriptionRecord> {
  return saasDb().subscription.create({
    data: {
      organizationId: input.organizationId,
      plan: input.plan ?? "BASIC",
      status: "ACTIVE",
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
    },
  });
}

export async function getActiveSubscription(organizationId: string) {
  return saasDb().subscription.findFirst({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export async function upgradePlan(input: {
  organizationId: string;
  plan: SubscriptionPlan;
  ownerEmail: string;
}) {
  const active = await getActiveSubscription(input.organizationId);
  const stripe = getStripeClient();

  let stripeCustomerId = active?.stripeCustomerId ?? undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.createCustomer({
      email: input.ownerEmail,
      organizationId: input.organizationId,
    });
    stripeCustomerId = customer.customerId;
  }

  const stripeSub = await stripe.createSubscription({
    customerId: stripeCustomerId,
    plan: input.plan,
  });

  if (active) {
    await saasDb().subscription.update({
      where: { id: active.id },
      data: { status: "CANCELED" },
    });
  }

  return createSubscription({
    organizationId: input.organizationId,
    plan: input.plan,
    stripeCustomerId,
    stripeSubscriptionId: stripeSub.subscriptionId,
  });
}

export async function cancelSubscription(organizationId: string) {
  const active = await getActiveSubscription(organizationId);
  if (!active) return null;
  return saasDb().subscription.update({
    where: { id: active.id },
    data: { status: "CANCELED" },
  });
}
