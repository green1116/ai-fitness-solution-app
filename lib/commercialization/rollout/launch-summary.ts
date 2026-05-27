/**
 * V3.7-H19 Production Rollout — launch summary (static aggregation)
 */

import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";

export const LAUNCH_SUMMARY_VERSION = "3.7-h19-launch-summary-1" as const;

export type LaunchSummary = {
  version: typeof LAUNCH_SUMMARY_VERSION;
  summaryId: string;
  deploymentReady: boolean;
  rolloutReady: boolean;
  onboardingReady: boolean;
  governanceReady: boolean;
  opsReady: boolean;
  releaseReady: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  deploymentReady: boolean;
  rolloutReady: boolean;
  onboardingReady: boolean;
  governanceReady: boolean;
  opsReady: boolean;
  releaseReady: boolean;
}): number {
  const weights = [
    flags.deploymentReady,
    flags.rolloutReady,
    flags.onboardingReady,
    flags.governanceReady,
    flags.opsReady,
    flags.releaseReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildLaunchSummary(input?: { deploymentId?: string }): LaunchSummary {
  const deploymentId = input?.deploymentId ?? "launch-summary";
  const summaryId = `LNS-V37H19-${deploymentId.slice(0, 8)}`;

  const rollout = buildEnterpriseRolloutFoundation({ deploymentId });
  const r = rollout.summary;

  const deploymentReady = r.deploymentReady;
  const rolloutReady = r.rolloutReady;
  const onboardingReady = r.onboardingReady;
  const governanceReady = r.governanceReady;
  const opsReady = r.operationalReady;
  const releaseReady = r.releaseReady;

  const confidenceScore = computeConfidenceScore({
    deploymentReady,
    rolloutReady,
    onboardingReady,
    governanceReady,
    opsReady,
    releaseReady,
  });

  return {
    version: LAUNCH_SUMMARY_VERSION,
    summaryId,
    deploymentReady,
    rolloutReady,
    onboardingReady,
    governanceReady,
    opsReady,
    releaseReady,
    confidenceScore,
    summary: `launch-summary id=${summaryId} deployment=${deploymentReady} rollout=${rolloutReady} onboarding=${onboardingReady} governance=${governanceReady} ops=${opsReady} release=${releaseReady} confidence=${confidenceScore}`,
  };
}
