/**
 * V3.7-H23 Enterprise Retention — manifest (static aggregation)
 */

import { ARCHIVAL_VERSION } from "../archival/archival-manifest";
import { LAUNCH_CLOSURE_VERSION } from "../launch-closure/launch-closure-manifest";
import { GO_LIVE_VERSION } from "../go-live/go-live-manifest";
import { ROLLOUT_VERSION } from "../rollout/handoff-manifest";
import { buildArchiveAccessSummary } from "./archive-access-summary";

export const RETENTION_MANIFEST_VERSION = "3.7-h23-manifest-1" as const;
export const RETENTION_VERSION = "3.7-h23-foundation-1" as const;

export type RetentionManifest = {
  version: typeof RETENTION_MANIFEST_VERSION;
  manifestId: string;
  RETENTION_VERSION: typeof RETENTION_VERSION;
  ARCHIVAL_VERSION: typeof ARCHIVAL_VERSION;
  LAUNCH_CLOSURE_VERSION: typeof LAUNCH_CLOSURE_VERSION;
  GO_LIVE_VERSION: typeof GO_LIVE_VERSION;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  readyForRetention: boolean;
  readyForLifecycle: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildRetentionManifest(input?: { deploymentId?: string }): RetentionManifest {
  const deploymentId = input?.deploymentId ?? "retention-manifest";
  const manifestId = `RTM-V37H23-${deploymentId.slice(0, 8)}`;
  const access = buildArchiveAccessSummary({ deploymentId });

  const readyForRetention = access.retentionReady && access.confidenceScore >= 80;
  const readyForLifecycle =
    readyForRetention &&
    access.lifecycleReady &&
    access.preservationReady;
  const readyForEnterprise =
    readyForLifecycle &&
    access.governanceRetentionReady &&
    access.auditRetentionReady;

  return {
    version: RETENTION_MANIFEST_VERSION,
    manifestId,
    RETENTION_VERSION,
    ARCHIVAL_VERSION,
    LAUNCH_CLOSURE_VERSION,
    GO_LIVE_VERSION,
    ROLLOUT_VERSION,
    readyForRetention,
    readyForLifecycle,
    readyForEnterprise,
    summary: `retention-manifest id=${manifestId} readyForRetention=${readyForRetention} readyForLifecycle=${readyForLifecycle} readyForEnterprise=${readyForEnterprise} confidence=${access.confidenceScore}`,
  };
}
