/**
 * V3.7-H24 Enterprise Lifecycle — manifest (static aggregation)
 */

import { RETENTION_VERSION } from "../retention/retention-manifest";
import { ARCHIVAL_VERSION } from "../archival/archival-manifest";
import { LAUNCH_CLOSURE_VERSION } from "../launch-closure/launch-closure-manifest";
import { GO_LIVE_VERSION } from "../go-live/go-live-manifest";
import { buildLifecycleCompletionSummary } from "./lifecycle-summary";

export const LIFECYCLE_MANIFEST_VERSION = "3.7-h24-manifest-1" as const;
export const LIFECYCLE_VERSION = "3.7-h24-foundation-1" as const;

export type LifecycleManifest = {
  version: typeof LIFECYCLE_MANIFEST_VERSION;
  manifestId: string;
  LIFECYCLE_VERSION: typeof LIFECYCLE_VERSION;
  RETENTION_VERSION: typeof RETENTION_VERSION;
  ARCHIVAL_VERSION: typeof ARCHIVAL_VERSION;
  LAUNCH_CLOSURE_VERSION: typeof LAUNCH_CLOSURE_VERSION;
  GO_LIVE_VERSION: typeof GO_LIVE_VERSION;
  readyForLifecycle: boolean;
  readyForContinuity: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildLifecycleManifest(input?: { deploymentId?: string }): LifecycleManifest {
  const deploymentId = input?.deploymentId ?? "lifecycle-manifest";
  const manifestId = `LCM-V37H24-${deploymentId.slice(0, 8)}`;
  const completion = buildLifecycleCompletionSummary({ deploymentId });

  const readyForLifecycle = completion.lifecycleReady && completion.confidenceScore >= 80;
  const readyForContinuity =
    readyForLifecycle &&
    completion.continuityReady &&
    completion.governanceContinuityReady &&
    completion.operationalContinuityReady;
  const readyForEnterprise =
    readyForContinuity &&
    completion.archivalContinuityReady &&
    completion.preservationContinuityReady;

  return {
    version: LIFECYCLE_MANIFEST_VERSION,
    manifestId,
    LIFECYCLE_VERSION,
    RETENTION_VERSION,
    ARCHIVAL_VERSION,
    LAUNCH_CLOSURE_VERSION,
    GO_LIVE_VERSION,
    readyForLifecycle,
    readyForContinuity,
    readyForEnterprise,
    summary: `lifecycle-manifest id=${manifestId} readyForLifecycle=${readyForLifecycle} readyForContinuity=${readyForContinuity} readyForEnterprise=${readyForEnterprise} confidence=${completion.confidenceScore}`,
  };
}
