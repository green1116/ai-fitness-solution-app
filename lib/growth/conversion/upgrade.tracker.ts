/**
 * V60 P1 — Upgrade conversion tracking
 */

import { appendGrowthEvent, getGrowthEventsSnapshot } from "../growth.events.store";
import { trackUpgradeClicked, trackPaymentCompleted } from "../analytics.events";

export function trackUpgradeIntent(input: {
  userId?: string;
  organizationId: string;
  fromPlan: string;
  toPlan: string;
  trigger: string;
}) {
  trackUpgradeClicked({
    userId: input.userId,
    organizationId: input.organizationId,
    targetPlan: input.toPlan,
    trigger: input.trigger,
  });

  appendGrowthEvent({
    event: "upgrade.clicked",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { fromPlan: input.fromPlan, toPlan: input.toPlan, trigger: input.trigger },
  });
}

export function trackConversionCompleted(input: {
  userId?: string;
  organizationId: string;
  plan: string;
  amount?: number;
  source?: string;
}) {
  trackPaymentCompleted({
    userId: input.userId,
    organizationId: input.organizationId,
    plan: input.plan,
    amount: input.amount,
  });

  appendGrowthEvent({
    event: "payment.completed",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { plan: input.plan, amount: input.amount, source: input.source ?? "stripe" },
  });
}

export function countUpgradeClicks(organizationId?: string): number {
  return getGrowthEventsSnapshot().filter(
    (e) => e.event === "upgrade.clicked" && (!organizationId || e.organizationId === organizationId),
  ).length;
}
