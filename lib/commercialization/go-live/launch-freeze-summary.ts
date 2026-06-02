/**
 * V3.7-H20 Production Go-Live — launch freeze summary (static aggregation)
 */

import { buildProductionRolloutFoundation } from "../rollout/index";
import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";
import { buildGoLiveChecklistConfig } from "./go-live-checklist";

export const LAUNCH_FREEZE_SUMMARY_VERSION = "3.7-h20-freeze-summary-1" as const;

export type LaunchFreezeSummary = {
  version: typeof LAUNCH_FREEZE_SUMMARY_VERSION;
  summaryId: string;
  readyForGoLive: boolean;
  launchFrozen: boolean;
  approvalsReady: boolean;
  rollbackReady: boolean;
  opsReady: boolean;
  governanceReady: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  readyForGoLive: boolean;
  launchFrozen: boolean;
  approvalsReady: boolean;
  rollbackReady: boolean;
  opsReady: boolean;
  governanceReady: boolean;
}): number {
  const weights = [
    flags.readyForGoLive,
    flags.launchFrozen,
    flags.approvalsReady,
    flags.rollbackReady,
    flags.opsReady,
    flags.governanceReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildLaunchFreezeSummary(input?: {
  deploymentId?: string;
}): LaunchFreezeSummary {
  const deploymentId = input?.deploymentId ?? "launch-freeze-summary";
  const summaryId = `LFS-V37H20-${deploymentId.slice(0, 8)}`;

  const rollout = buildProductionRolloutFoundation({ deploymentId });
  const readiness = buildEnterpriseRolloutFoundation({ deploymentId });
  const checklist = buildGoLiveChecklistConfig({ deploymentId });

  const launch = rollout.launch;
  const handoff = rollout.handoff;

  const approvalsReady = checklist.approvalChecks.every((c) => c.status === "complete");

  const rollbackReady = checklist.rollbackChecks.every((c) => c.status === "complete");
  const opsReady = launch.opsReady && handoff.readyForHandoff;
  const governanceReady = launch.governanceReady && approvalsReady;

  const launchFrozen =
    launch.deploymentReady &&
    readiness.manifest.readyForDeployment &&
    checklist.requiredChecks.every((c) => c.status === "complete");

  const readyForGoLive =
    handoff.readyForEnterprise &&
    launchFrozen &&
    approvalsReady &&
    rollbackReady &&
    opsReady &&
    governanceReady;

  const confidenceScore = computeConfidenceScore({
    readyForGoLive,
    launchFrozen,
    approvalsReady,
    rollbackReady,
    opsReady,
    governanceReady,
  });

  return {
    version: LAUNCH_FREEZE_SUMMARY_VERSION,
    summaryId,
    readyForGoLive,
    launchFrozen,
    approvalsReady,
    rollbackReady,
    opsReady,
    governanceReady,
    confidenceScore,
    summary: `launch-freeze-summary id=${summaryId} readyForGoLive=${readyForGoLive} launchFrozen=${launchFrozen} approvals=${approvalsReady} rollback=${rollbackReady} ops=${opsReady} governance=${governanceReady} confidence=${confidenceScore}`,
  };
}
