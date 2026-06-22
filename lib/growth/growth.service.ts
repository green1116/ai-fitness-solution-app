/**
 * V60 P1 — Growth service orchestrator (API layer entry)
 */

import {
  trackSignup,
  trackActivation,
  trackQuoteGenerated,
  trackUpgradeClicked,
  trackPaymentCompleted,
  trackProjectCreated,
  trackReturnSession,
} from "./analytics.events";
import { evaluatePaywall, resolvePaywallForFeatureGateError } from "./conversion/paywall.engine";
import { trackConversionCompleted, trackUpgradeIntent } from "./conversion/upgrade.tracker";
import { advanceOnboardingStep, resolveOnboardingProgress } from "./activation/onboarding.flow";
import { trackFirstAction } from "./activation/first-action.tracker";
import { aggregateGrowthMetrics, buildFunnelSnapshot, buildGrowthDashboard } from "./funnel/funnel.analytics";
import { computeRetentionProfile } from "./retention/retention.metrics";
import { buildReactivationCampaign } from "./retention/reactivation.engine";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import type { ConversionTrigger } from "./conversion/paywall.engine";

export async function recordQuoteGenerationSuccess(input: {
  userId?: string;
  organizationId: string;
  projectId?: string;
  isFirst?: boolean;
}) {
  trackQuoteGenerated(input);
  if (input.userId && input.isFirst) {
    trackFirstAction({
      userId: input.userId,
      organizationId: input.organizationId,
      action: "quote",
      resourceId: input.projectId,
    });
  }
}

export async function recordProjectCreation(input: {
  userId?: string;
  organizationId: string;
  projectId: string;
  isFirst?: boolean;
}) {
  trackProjectCreated(input);
  if (input.userId) {
    if (input.isFirst) {
      trackFirstAction({
        userId: input.userId,
        organizationId: input.organizationId,
        action: "project",
        resourceId: input.projectId,
      });
    }
    advanceOnboardingStep(input.userId, "create_first_project", input.organizationId);
  }
}

export async function recordFeatureGateBlocked(input: {
  organizationId: string;
  userId?: string;
  feature: FeatureKey;
}) {
  return resolvePaywallForFeatureGateError(input);
}

export async function recordPaywallCheck(input: {
  organizationId: string;
  trigger: ConversionTrigger;
  userId?: string;
}) {
  return evaluatePaywall(input);
}

export {
  trackSignup,
  trackActivation,
  trackQuoteGenerated,
  trackUpgradeClicked,
  trackPaymentCompleted,
  trackReturnSession,
  trackUpgradeIntent,
  trackConversionCompleted,
  evaluatePaywall,
  resolveOnboardingProgress,
  advanceOnboardingStep,
  aggregateGrowthMetrics,
  buildFunnelSnapshot,
  buildGrowthDashboard,
  computeRetentionProfile,
  buildReactivationCampaign,
};
