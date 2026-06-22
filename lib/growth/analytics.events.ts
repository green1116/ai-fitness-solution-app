/**
 * V60 P1 — Growth analytics event tracking (required埋点)
 */

import { appendGrowthEvent } from "./growth.events.store";

export function trackSignup(input: { userId: string; source?: string; utmSource?: string }) {
  appendGrowthEvent({
    event: "user.signup",
    userId: input.userId,
    source: input.source,
    utmSource: input.utmSource,
  });
}

export function trackActivation(input: { userId: string; organizationId: string }) {
  appendGrowthEvent({
    event: "user.activation",
    userId: input.userId,
    organizationId: input.organizationId,
  });
}

export function trackQuoteGenerated(input: {
  userId?: string;
  organizationId: string;
  projectId?: string;
  isFirst?: boolean;
}) {
  appendGrowthEvent({
    event: "quote.generated",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { projectId: input.projectId, isFirst: input.isFirst ?? false },
  });
}

export function trackUpgradeClicked(input: {
  userId?: string;
  organizationId: string;
  targetPlan: string;
  trigger?: string;
}) {
  appendGrowthEvent({
    event: "upgrade.clicked",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { targetPlan: input.targetPlan, trigger: input.trigger },
  });
}

export function trackPaymentCompleted(input: {
  userId?: string;
  organizationId: string;
  plan: string;
  amount?: number;
}) {
  appendGrowthEvent({
    event: "payment.completed",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { plan: input.plan, amount: input.amount },
  });
}

export function trackLandingVisit(input: {
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  appendGrowthEvent({
    event: input.utmSource ? "visitor.utm" : "visitor.landing",
    source: input.source,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
  });
}

export function trackProjectCreated(input: { userId?: string; organizationId: string; projectId: string }) {
  appendGrowthEvent({
    event: "project.created",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { projectId: input.projectId },
  });
}

export function trackPaywallShown(input: {
  userId?: string;
  organizationId: string;
  feature: string;
  trigger: string;
  currentPlan: string;
}) {
  appendGrowthEvent({
    event: "paywall.shown",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: {
      feature: input.feature,
      trigger: input.trigger,
      currentPlan: input.currentPlan,
    },
  });
}

export function trackReturnSession(input: { userId: string; organizationId?: string }) {
  appendGrowthEvent({
    event: "session.return",
    userId: input.userId,
    organizationId: input.organizationId,
  });
}

export function trackBudgetCalculated(input: { userId?: string; organizationId: string; quoteId?: string }) {
  appendGrowthEvent({
    event: "budget.calculated",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { quoteId: input.quoteId },
  });
}

export function trackTenderGenerated(input: { userId?: string; organizationId: string; projectId?: string }) {
  appendGrowthEvent({
    event: "tender.generated",
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { projectId: input.projectId },
  });
}
