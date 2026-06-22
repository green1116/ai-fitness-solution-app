/**
 * V59.4 — Subscription status sync from Stripe webhooks
 */

import { saasDb, type SaasPlan, type SaasSubStatus } from "@/lib/saas/types";

import {
  findSubscriptionByStripeSubscriptionId,
  getActiveSubscriptionForOrganization,
} from "./subscription.resolver";

export async function syncStripeCustomer(input: {
  organizationId: string;
  stripeCustomerId: string;
}) {
  const active = await getActiveSubscriptionForOrganization(input.organizationId);
  if (active) {
    return saasDb().subscription.update({
      where: { id: active.id },
      data: { stripeCustomerId: input.stripeCustomerId },
    });
  }

  return saasDb().subscription.create({
    data: {
      organizationId: input.organizationId,
      plan: "BASIC",
      status: "ACTIVE",
      stripeCustomerId: input.stripeCustomerId,
    },
  });
}

export async function updateSubscriptionStatus(input: {
  organizationId: string;
  plan: SaasPlan;
  status: SaasSubStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
}) {
  const active = await getActiveSubscriptionForOrganization(input.organizationId);

  if (active && active.stripeSubscriptionId !== input.stripeSubscriptionId && input.status === "ACTIVE") {
    await saasDb().subscription.update({
      where: { id: active.id },
      data: { status: "CANCELED" },
    });
  }

  if (active && active.stripeSubscriptionId === input.stripeSubscriptionId) {
    return saasDb().subscription.update({
      where: { id: active.id },
      data: {
        plan: input.plan,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId ?? active.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId ?? active.stripeSubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd,
      },
    });
  }

  return saasDb().subscription.create({
    data: {
      organizationId: input.organizationId,
      plan: input.plan,
      status: input.status,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      currentPeriodEnd: input.currentPeriodEnd,
    },
  });
}

export async function cancelSubscriptionByStripeId(stripeSubscriptionId: string) {
  const sub = await findSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
  if (!sub) return null;
  return saasDb().subscription.update({
    where: { id: sub.id },
    data: { status: "CANCELED" },
  });
}
