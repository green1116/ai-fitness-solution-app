/**
 * Post-Launch P2 — Engagement Metrics
 */

import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getCustomerActivation } from "../../launch/onboarding/onboarding.activation";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { getLatestAdoption } from "./success.adoption";
import { getCustomerHealthProfile } from "./success.health";
import { listLifecycleOperations } from "./success.lifecycle";
import { listSuccessWorkflows } from "./success.workflow";
import type { EngagementMetrics } from "./success.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeEngagementMetrics(
  customerHealthProfileId: string,
): EngagementMetrics {
  const profile = getCustomerHealthProfile(customerHealthProfileId.trim());
  if (!profile) {
    throw new Error(
      `customer health profile not found: ${customerHealthProfileId}`,
    );
  }

  const adoption = getLatestAdoption(profile.id);
  const workflows = listSuccessWorkflows({
    customerHealthProfileId: profile.id,
  });
  const workflowComplete = workflows.some((w) => w.complete && !w.failed);
  const lifecycleStage = getCustomerLifecycleStage(
    profile.organizationId,
    profile.productId,
  );

  let slaActive = false;
  if (profile.supportSlaProfileId) {
    const sla = getSupportSlaProfile(profile.supportSlaProfileId);
    slaActive = sla?.status === "ACTIVE";
  }

  let activationBoost = 0;
  if (profile.onboardingProfileId) {
    const activation = getCustomerActivation(profile.onboardingProfileId);
    if (activation?.state === "ACTIVE") activationBoost = 10;
  }

  const adoptionBoost =
    adoption?.stage === "EXPANDING"
      ? 20
      : adoption?.stage === "ADOPTED"
        ? 15
        : adoption?.stage === "ADOPTING"
          ? 10
          : adoption
            ? 5
            : 0;

  const lifecycleBoost =
    lifecycleStage === "ACTIVE"
      ? 15
      : lifecycleStage === "ONBOARDING"
        ? 8
        : lifecycleStage === "AT_RISK"
          ? -10
          : lifecycleStage === "CHURNED"
            ? -25
            : 0;

  const workflowBoost = workflowComplete ? 10 : 0;
  const slaBoost = slaActive ? 10 : 0;
  const opsBoost = listLifecycleOperations({
    customerHealthProfileId: profile.id,
  }).length
    ? 5
    : 0;

  const engagementScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        profile.score * 0.5 +
          adoptionBoost +
          lifecycleBoost +
          workflowBoost +
          slaBoost +
          activationBoost +
          opsBoost,
      ),
    ),
  );

  return {
    customerHealthProfileId: profile.id,
    health: profile.health,
    healthScore: profile.score,
    adoptionStage: adoption?.stage,
    activeUsers: adoption?.activeUsers ?? 0,
    featureCount: adoption?.featureCount ?? 0,
    workflowComplete,
    lifecycleStage,
    slaActive,
    engagementScore,
    computedAt: nowIso(),
  };
}
