/**
 * V3.7-H25 Enterprise Preservation Closure — manifest (static aggregation)
 */

import { LIFECYCLE_VERSION } from "../lifecycle/lifecycle-manifest";
import { RETENTION_VERSION } from "../retention/retention-manifest";
import { ARCHIVAL_VERSION } from "../archival/archival-manifest";
import { LAUNCH_CLOSURE_VERSION } from "../launch-closure/launch-closure-manifest";
import { buildPreservationClosureSummary } from "./preservation-summary";

export const PRESERVATION_CLOSURE_MANIFEST_VERSION = "3.7-h25-manifest-1" as const;
export const PRESERVATION_CLOSURE_VERSION = "3.7-h25-foundation-1" as const;

export type PreservationClosureManifest = {
  version: typeof PRESERVATION_CLOSURE_MANIFEST_VERSION;
  manifestId: string;
  PRESERVATION_CLOSURE_VERSION: typeof PRESERVATION_CLOSURE_VERSION;
  LIFECYCLE_VERSION: typeof LIFECYCLE_VERSION;
  RETENTION_VERSION: typeof RETENTION_VERSION;
  ARCHIVAL_VERSION: typeof ARCHIVAL_VERSION;
  LAUNCH_CLOSURE_VERSION: typeof LAUNCH_CLOSURE_VERSION;
  readyForPreservationClosure: boolean;
  readyForLifecycleClosure: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildPreservationClosureManifest(input?: {
  deploymentId?: string;
}): PreservationClosureManifest {
  const deploymentId = input?.deploymentId ?? "preservation-closure-manifest";
  const manifestId = `PCM-V37H25-${deploymentId.slice(0, 8)}`;
  const summary = buildPreservationClosureSummary({ deploymentId });

  const readyForPreservationClosure =
    summary.preservationReady && summary.confidenceScore >= 80;
  const readyForLifecycleClosure =
    readyForPreservationClosure &&
    summary.lifecycleClosureReady &&
    summary.archivalClosureReady;
  const readyForEnterprise =
    readyForLifecycleClosure &&
    summary.governanceClosureReady &&
    summary.operationalClosureReady &&
    summary.closureReady;

  return {
    version: PRESERVATION_CLOSURE_MANIFEST_VERSION,
    manifestId,
    PRESERVATION_CLOSURE_VERSION,
    LIFECYCLE_VERSION,
    RETENTION_VERSION,
    ARCHIVAL_VERSION,
    LAUNCH_CLOSURE_VERSION,
    readyForPreservationClosure,
    readyForLifecycleClosure,
    readyForEnterprise,
    summary: `preservation-closure-manifest id=${manifestId} readyForPreservationClosure=${readyForPreservationClosure} readyForLifecycleClosure=${readyForLifecycleClosure} readyForEnterprise=${readyForEnterprise} confidence=${summary.confidenceScore}`,
  };
}
