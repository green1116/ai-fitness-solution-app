import { buildAdoptionMetrics } from "./adoption";
import { buildEngagementProfile } from "./engagement";
import { buildCustomerHealth } from "./health";
import { buildRenewalProfile } from "./renewal";
import type { CustomerSuccessResponse, SuccessScore, SuccessSummary } from "./types";
import { CUSTOMER_SUCCESS_VERSION } from "./types";

function computeSuccessScore(
  deploymentId: string,
  input: {
    healthScore: number;
    adoptionScore: number;
    engagementScore: number;
    renewalScore: number;
  },
): SuccessScore {
  const overallScore = Math.round(
    (input.healthScore + input.adoptionScore + input.engagementScore + input.renewalScore) / 4,
  );
  return {
    scoreId: `success-score-${deploymentId}`,
    overallScore,
    healthScore: input.healthScore,
    adoptionScore: input.adoptionScore,
    engagementScore: input.engagementScore,
    renewalScore: input.renewalScore,
  };
}

function adoptionScoreFromMetrics(adoption: ReturnType<typeof buildAdoptionMetrics>): number {
  const utilization = adoption.workspaceUtilization;
  const activity =
    Math.min(100, adoption.generatedPlans * 2) * 0.25 +
    Math.min(100, adoption.proposalExports * 4) * 0.25;
  return Math.round(utilization * 0.5 + activity * 0.5);
}

function engagementScoreFromProfile(engagement: ReturnType<typeof buildEngagementProfile>): number {
  return Math.round(
    (engagement.featureUsage + engagement.projectActivity + engagement.deliveryParticipation) / 3,
  );
}

export function buildSuccessSummary(input?: { deploymentId?: string }): SuccessSummary {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  const health = buildCustomerHealth({ deploymentId });
  const adoption = buildAdoptionMetrics({ deploymentId });
  const engagement = buildEngagementProfile({ deploymentId });
  const renewal = buildRenewalProfile({ deploymentId });

  const successScore = computeSuccessScore(deploymentId, {
    healthScore: health.score,
    adoptionScore: adoptionScoreFromMetrics(adoption),
    engagementScore: engagementScoreFromProfile(engagement),
    renewalScore: renewal.renewalProbability,
  });

  return {
    summaryId: `success-summary-${deploymentId}`,
    version: CUSTOMER_SUCCESS_VERSION,
    customerId: health.customerId,
    healthStatus: health.status,
    successScore,
    summary: `success-summary customer=${health.customerId} health=${health.status} overallScore=${successScore.overallScore} renewalProbability=${renewal.renewalProbability}%`,
  };
}

export function buildCustomerSuccessResponse(input?: {
  deploymentId?: string;
}): CustomerSuccessResponse {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  return {
    version: CUSTOMER_SUCCESS_VERSION,
    health: buildCustomerHealth({ deploymentId }),
    adoption: buildAdoptionMetrics({ deploymentId }),
    engagement: buildEngagementProfile({ deploymentId }),
    renewal: buildRenewalProfile({ deploymentId }),
    summary: buildSuccessSummary({ deploymentId }),
  };
}

export function validateCustomerSuccess(input?: { deploymentId?: string }): {
  healthValid: boolean;
  adoptionValid: boolean;
  engagementValid: boolean;
  renewalValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  const response = buildCustomerSuccessResponse({ deploymentId });

  const healthValid =
    response.health.healthId.length > 0 &&
    ["healthy", "attention", "at-risk", "critical"].includes(response.health.status) &&
    response.health.score >= 0;

  const adoptionValid =
    response.adoption.workspaceUtilization >= 0 &&
    response.adoption.activeUsers >= 0 &&
    response.adoption.generatedPlans >= 0 &&
    response.adoption.generatedBudgets >= 0 &&
    response.adoption.proposalExports >= 0 &&
    response.adoption.tenderExports >= 0;

  const engagementValid =
    response.engagement.loginFrequency >= 0 &&
    response.engagement.featureUsage >= 0 &&
    response.engagement.projectActivity >= 0 &&
    response.engagement.deliveryParticipation >= 0;

  const renewalValid =
    response.renewal.renewalProbability >= 0 &&
    response.renewal.expansionOpportunity >= 0 &&
    response.renewal.riskIndicators.length > 0 &&
    response.renewal.recommendations.length > 0;

  const summaryValid =
    response.summary.summaryId.length > 0 &&
    response.summary.customerId === response.health.customerId &&
    response.summary.successScore.overallScore >= 0 &&
    response.summary.summary.length > 0;

  return {
    healthValid,
    adoptionValid,
    engagementValid,
    renewalValid,
    summaryValid,
  };
}
