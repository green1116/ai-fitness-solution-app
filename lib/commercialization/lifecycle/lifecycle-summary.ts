/**
 * V3.7-H24 Enterprise Lifecycle — completion summary (static aggregation)
 */

import { buildLifecycleContinuityConfig } from "./lifecycle-continuity";
import { buildEnterpriseRetentionFoundation } from "../retention/index";
import { buildEnterpriseArchivalFoundation } from "../archival/index";

export const LIFECYCLE_SUMMARY_VERSION = "3.7-h24-summary-1" as const;

export type LifecycleCompletionSummary = {
  version: typeof LIFECYCLE_SUMMARY_VERSION;
  summaryId: string;
  lifecycleReady: boolean;
  continuityReady: boolean;
  governanceContinuityReady: boolean;
  operationalContinuityReady: boolean;
  archivalContinuityReady: boolean;
  preservationContinuityReady: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  lifecycleReady: boolean;
  continuityReady: boolean;
  governanceContinuityReady: boolean;
  operationalContinuityReady: boolean;
  archivalContinuityReady: boolean;
  preservationContinuityReady: boolean;
}): number {
  const weights = [
    flags.lifecycleReady,
    flags.continuityReady,
    flags.governanceContinuityReady,
    flags.operationalContinuityReady,
    flags.archivalContinuityReady,
    flags.preservationContinuityReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildLifecycleCompletionSummary(input?: {
  deploymentId?: string;
}): LifecycleCompletionSummary {
  const deploymentId = input?.deploymentId ?? "lifecycle-summary";
  const summaryId = `LCS-V37H24-${deploymentId.slice(0, 8)}`;

  const config = buildLifecycleContinuityConfig({ deploymentId });
  const retention = buildEnterpriseRetentionFoundation({ deploymentId });
  const archival = buildEnterpriseArchivalFoundation({ deploymentId });

  const lifecycleReady = config.lifecycleStages.every((s) => s.ready);
  const continuityReady = config.continuityStages.every((s) => s.ready);
  const governanceContinuityReady = config.governanceStages.every((s) => s.ready);
  const operationalContinuityReady = config.operationalStages.every((s) => s.ready);
  const archivalContinuityReady =
    config.archivalStages.every((s) => s.ready) && archival.manifest.readyForPreservation;
  const preservationContinuityReady =
    config.preservationStages.every((s) => s.ready) && retention.manifest.readyForEnterprise;

  const confidenceScore = computeConfidenceScore({
    lifecycleReady,
    continuityReady,
    governanceContinuityReady,
    operationalContinuityReady,
    archivalContinuityReady,
    preservationContinuityReady,
  });

  return {
    version: LIFECYCLE_SUMMARY_VERSION,
    summaryId,
    lifecycleReady,
    continuityReady,
    governanceContinuityReady,
    operationalContinuityReady,
    archivalContinuityReady,
    preservationContinuityReady,
    confidenceScore,
    summary: `lifecycle-summary id=${summaryId} lifecycle=${lifecycleReady} continuity=${continuityReady} governance=${governanceContinuityReady} ops=${operationalContinuityReady} archival=${archivalContinuityReady} preservation=${preservationContinuityReady} confidence=${confidenceScore}`,
  };
}
