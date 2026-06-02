/**
 * V3.7-H21 Enterprise Launch Closure — readiness closure summary (static aggregation)
 */

import { buildLaunchClosureChecklist } from "./launch-closure-checklist";
import { buildProductionGoLiveFoundation } from "../go-live/index";
import { buildProductionRolloutFoundation } from "../rollout/index";

export const READINESS_CLOSURE_SUMMARY_VERSION = "3.7-h21-closure-summary-1" as const;

export type ReadinessClosureSummary = {
  version: typeof READINESS_CLOSURE_SUMMARY_VERSION;
  summaryId: string;
  readyForClosure: boolean;
  rolloutCompleted: boolean;
  governanceCompleted: boolean;
  opsCompleted: boolean;
  auditCompleted: boolean;
  releaseCompleted: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  readyForClosure: boolean;
  rolloutCompleted: boolean;
  governanceCompleted: boolean;
  opsCompleted: boolean;
  auditCompleted: boolean;
  releaseCompleted: boolean;
}): number {
  const weights = [
    flags.readyForClosure,
    flags.rolloutCompleted,
    flags.governanceCompleted,
    flags.opsCompleted,
    flags.auditCompleted,
    flags.releaseCompleted,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildReadinessClosureSummary(input?: {
  deploymentId?: string;
}): ReadinessClosureSummary {
  const deploymentId = input?.deploymentId ?? "readiness-closure-summary";
  const summaryId = `RCS-V37H21-${deploymentId.slice(0, 8)}`;

  const checklist = buildLaunchClosureChecklist({ deploymentId });
  const goLive = buildProductionGoLiveFoundation({ deploymentId });
  const rollout = buildProductionRolloutFoundation({ deploymentId });

  const rolloutCompleted = checklist.rolloutCompletions.every((c) => c.status === "complete");
  const governanceCompleted = checklist.governanceCompletions.every((c) => c.status === "complete");
  const opsCompleted = checklist.opsCompletions.every((c) => c.status === "complete");
  const auditCompleted = checklist.closureItems
    .filter((c) => c.group === "audit")
    .every((c) => c.status === "complete");
  const releaseCompleted = checklist.closureItems
    .filter((c) => c.group === "release")
    .every((c) => c.status === "complete");

  const requiredComplete = checklist.requiredCompletions.every((c) => c.status === "complete");

  const readyForClosure =
    goLive.manifest.readyForEnterprise &&
    rollout.handoff.readyForEnterprise &&
    requiredComplete &&
    rolloutCompleted &&
    governanceCompleted &&
    opsCompleted &&
    auditCompleted &&
    releaseCompleted;

  const confidenceScore = computeConfidenceScore({
    readyForClosure,
    rolloutCompleted,
    governanceCompleted,
    opsCompleted,
    auditCompleted,
    releaseCompleted,
  });

  return {
    version: READINESS_CLOSURE_SUMMARY_VERSION,
    summaryId,
    readyForClosure,
    rolloutCompleted,
    governanceCompleted,
    opsCompleted,
    auditCompleted,
    releaseCompleted,
    confidenceScore,
    summary: `readiness-closure-summary id=${summaryId} readyForClosure=${readyForClosure} rollout=${rolloutCompleted} governance=${governanceCompleted} ops=${opsCompleted} audit=${auditCompleted} release=${releaseCompleted} confidence=${confidenceScore}`,
  };
}
