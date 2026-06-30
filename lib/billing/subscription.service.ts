/**
 * V59 SaaS — Subscription service
 */

import { getStripeClient } from "@/lib/billing/stripe.client";
import { prisma } from "@/lib/prisma";
import { normalizeSaasPlan, normalizeSaasSubStatus } from "@/lib/saas/plan.compat";
import type { SaasPlan, SaasSubStatus, SubscriptionRecord } from "@/lib/saas/types";

export type SubscriptionPlan = SaasPlan;

function toSubscriptionRecord(row: {
  id: string;
  organizationId: string;
  plan: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SubscriptionRecord {
  return {
    id: row.id,
    organizationId: row.organizationId,
    plan: normalizeSaasPlan(row.plan),
    status: normalizeSaasSubStatus(row.status),
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    currentPeriodEnd: row.currentPeriodEnd,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createSubscription(input: {
  organizationId: string;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}): Promise<SubscriptionRecord> {
  const row = await prisma.subscription.create({
    data: {
      organizationId: input.organizationId,
      plan: input.plan ?? "BASIC",
      status: "ACTIVE",
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
    },
  });
  return toSubscriptionRecord(row);
}

export async function getActiveSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
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
    await prisma.subscription.update({
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
  return prisma.subscription.update({
    where: { id: active.id },
    data: { status: "CANCELED" },
  });
}
