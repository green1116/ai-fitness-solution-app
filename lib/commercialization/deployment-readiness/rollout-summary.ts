/**
 * V3.7-H18 Enterprise Rollout — rollout readiness summary (static aggregation)
 */

import { buildDeploymentReadinessConfig } from "./deployment-readiness";
import { buildEnterpriseLandingFoundation } from "../landing/index";

export const ROLLOUT_SUMMARY_VERSION = "3.7-h18-rollout-summary-1" as const;

export type RolloutReadinessSummary = {
  version: typeof ROLLOUT_SUMMARY_VERSION;
  summaryId: string;
  deploymentReady: boolean;
  rolloutReady: boolean;
  onboardingReady: boolean;
  governanceReady: boolean;
  operationalReady: boolean;
  releaseReady: boolean;
  confidenceScore: number;
  summary: string;
};

function allPassed(checks: { passed: boolean }[]): boolean {
  return checks.length > 0 && checks.every((c) => c.passed);
}

function computeConfidenceScore(flags: {
  deploymentReady: boolean;
  rolloutReady: boolean;
  onboardingReady: boolean;
  governanceReady: boolean;
  operationalReady: boolean;
  releaseReady: boolean;
}): number {
  const weights = [
    flags.deploymentReady,
    flags.rolloutReady,
    flags.onboardingReady,
    flags.governanceReady,
    flags.operationalReady,
    flags.releaseReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildRolloutReadinessSummary(input?: {
  deploymentId?: string;
}): RolloutReadinessSummary {
  const deploymentId = input?.deploymentId ?? "rollout-summary";
  const summaryId = `RRS-V37H18-${deploymentId.slice(0, 8)}`;

  const config = buildDeploymentReadinessConfig({ deploymentId });
  const landing = buildEnterpriseLandingFoundation({ deploymentId });

  const deploymentReady = allPassed(config.deploymentChecks);
  const rolloutReady = allPassed(config.rolloutChecks) && landing.manifest.readyForDeployment;
  const onboardingReady = allPassed(config.onboardingChecks);
  const governanceReady = allPassed(config.governanceChecks);
  const operationalReady = allPassed(config.operationalChecks);
  const releaseReady = allPassed(config.releaseChecks);

  const confidenceScore = computeConfidenceScore({
    deploymentReady,
    rolloutReady,
    onboardingReady,
    governanceReady,
    operationalReady,
    releaseReady,
  });

  return {
    version: ROLLOUT_SUMMARY_VERSION,
    summaryId,
    deploymentReady,
    rolloutReady,
    onboardingReady,
    governanceReady,
    operationalReady,
    releaseReady,
    confidenceScore,
    summary: `rollout-readiness id=${summaryId} deployment=${deploymentReady} rollout=${rolloutReady} onboarding=${onboardingReady} governance=${governanceReady} operational=${operationalReady} release=${releaseReady} confidence=${confidenceScore}`,
  };
}
