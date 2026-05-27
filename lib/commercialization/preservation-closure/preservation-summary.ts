/**
 * V3.7-H25 Enterprise Preservation Closure — summary (static aggregation)
 */

import { buildPreservationClosureConfig } from "./preservation-closure";
import { buildEnterpriseLifecycleFoundation } from "../lifecycle/index";

export const PRESERVATION_CLOSURE_SUMMARY_VERSION = "3.7-h25-closure-summary-1" as const;

export type PreservationClosureSummary = {
  version: typeof PRESERVATION_CLOSURE_SUMMARY_VERSION;
  summaryId: string;
  preservationReady: boolean;
  closureReady: boolean;
  governanceClosureReady: boolean;
  operationalClosureReady: boolean;
  archivalClosureReady: boolean;
  lifecycleClosureReady: boolean;
  confidenceScore: number;
  summary: string;
};

function computeConfidenceScore(flags: {
  preservationReady: boolean;
  closureReady: boolean;
  governanceClosureReady: boolean;
  operationalClosureReady: boolean;
  archivalClosureReady: boolean;
  lifecycleClosureReady: boolean;
}): number {
  const weights = [
    flags.preservationReady,
    flags.closureReady,
    flags.governanceClosureReady,
    flags.operationalClosureReady,
    flags.archivalClosureReady,
    flags.lifecycleClosureReady,
  ];
  return Math.round((weights.filter(Boolean).length / weights.length) * 100);
}

export function buildPreservationClosureSummary(input?: {
  deploymentId?: string;
}): PreservationClosureSummary {
  const deploymentId = input?.deploymentId ?? "preservation-closure-summary";
  const summaryId = `PCS-V37H25-${deploymentId.slice(0, 8)}`;

  const config = buildPreservationClosureConfig({ deploymentId });
  const lifecycle = buildEnterpriseLifecycleFoundation({ deploymentId });

  const preservationReady = config.preservationStages.every((s) => s.ready);
  const closureReady = config.closureStages.every((s) => s.ready);
  const governanceClosureReady = config.governanceClosureStages.every((s) => s.ready);
  const operationalClosureReady = config.operationalClosureStages.every((s) => s.ready);
  const archivalClosureReady = config.archivalClosureStages.every((s) => s.ready);
  const lifecycleClosureReady =
    config.lifecycleClosureStages.every((s) => s.ready) && lifecycle.manifest.readyForEnterprise;

  const confidenceScore = computeConfidenceScore({
    preservationReady,
    closureReady,
    governanceClosureReady,
    operationalClosureReady,
    archivalClosureReady,
    lifecycleClosureReady,
  });

  return {
    version: PRESERVATION_CLOSURE_SUMMARY_VERSION,
    summaryId,
    preservationReady,
    closureReady,
    governanceClosureReady,
    operationalClosureReady,
    archivalClosureReady,
    lifecycleClosureReady,
    confidenceScore,
    summary: `preservation-closure-summary id=${summaryId} preservation=${preservationReady} closure=${closureReady} governance=${governanceClosureReady} ops=${operationalClosureReady} archival=${archivalClosureReady} lifecycle=${lifecycleClosureReady} confidence=${confidenceScore}`,
  };
}
