/**
 * V3.7-H22 Enterprise Archival — manifest (static aggregation)
 */

import { LAUNCH_CLOSURE_VERSION } from "../launch-closure/launch-closure-manifest";
import { GO_LIVE_VERSION } from "../go-live/go-live-manifest";
import { ROLLOUT_VERSION } from "../rollout/handoff-manifest";
import { LANDING_VERSION } from "../landing/landing-manifest";
import { buildPreservationSummary } from "./preservation-summary";

export const ARCHIVAL_MANIFEST_VERSION = "3.7-h22-manifest-1" as const;
export const ARCHIVAL_VERSION = "3.7-h22-foundation-1" as const;

export type ArchivalManifest = {
  version: typeof ARCHIVAL_MANIFEST_VERSION;
  manifestId: string;
  ARCHIVAL_VERSION: typeof ARCHIVAL_VERSION;
  LAUNCH_CLOSURE_VERSION: typeof LAUNCH_CLOSURE_VERSION;
  GO_LIVE_VERSION: typeof GO_LIVE_VERSION;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  LANDING_VERSION: typeof LANDING_VERSION;
  readyForArchive: boolean;
  readyForPreservation: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildArchivalManifest(input?: { deploymentId?: string }): ArchivalManifest {
  const deploymentId = input?.deploymentId ?? "archival-manifest";
  const manifestId = `ARM-V37H22-${deploymentId.slice(0, 8)}`;
  const preservation = buildPreservationSummary({ deploymentId });

  const readyForArchive = preservation.readyForArchive && preservation.confidenceScore >= 80;
  const readyForPreservation =
    readyForArchive &&
    preservation.preservationCompleted &&
    preservation.governanceArchived &&
    preservation.releaseArchived;
  const readyForEnterprise =
    readyForPreservation &&
    preservation.opsArchived &&
    preservation.auditArchived;

  return {
    version: ARCHIVAL_MANIFEST_VERSION,
    manifestId,
    ARCHIVAL_VERSION,
    LAUNCH_CLOSURE_VERSION,
    GO_LIVE_VERSION,
    ROLLOUT_VERSION,
    LANDING_VERSION,
    readyForArchive,
    readyForPreservation,
    readyForEnterprise,
    summary: `archival-manifest id=${manifestId} readyForArchive=${readyForArchive} readyForPreservation=${readyForPreservation} readyForEnterprise=${readyForEnterprise} confidence=${preservation.confidenceScore}`,
  };
}
