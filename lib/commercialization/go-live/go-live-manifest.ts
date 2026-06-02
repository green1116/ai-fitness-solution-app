/**
 * V3.7-H20 Production Go-Live — manifest (static aggregation)
 */

import { ROLLOUT_VERSION } from "../rollout/handoff-manifest";
import { LANDING_VERSION } from "../landing/landing-manifest";
import { COMMAND_CENTER_VERSION } from "../command-center/command-center-manifest";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { buildLaunchFreezeSummary } from "./launch-freeze-summary";

export const GO_LIVE_MANIFEST_VERSION = "3.7-h20-manifest-1" as const;
export const GO_LIVE_VERSION = "3.7-h20-foundation-1" as const;

export type GoLiveManifest = {
  version: typeof GO_LIVE_MANIFEST_VERSION;
  manifestId: string;
  GO_LIVE_VERSION: typeof GO_LIVE_VERSION;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  LANDING_VERSION: typeof LANDING_VERSION;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  readyForGoLive: boolean;
  readyForFreeze: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildGoLiveManifest(input?: { deploymentId?: string }): GoLiveManifest {
  const deploymentId = input?.deploymentId ?? "go-live-manifest";
  const manifestId = `GLM-V37H20-${deploymentId.slice(0, 8)}`;
  const freeze = buildLaunchFreezeSummary({ deploymentId });

  const readyForFreeze = freeze.launchFrozen && freeze.confidenceScore >= 80;
  const readyForGoLive = freeze.readyForGoLive && readyForFreeze;
  const readyForEnterprise = readyForGoLive && freeze.approvalsReady && freeze.rollbackReady;

  return {
    version: GO_LIVE_MANIFEST_VERSION,
    manifestId,
    GO_LIVE_VERSION,
    ROLLOUT_VERSION,
    LANDING_VERSION,
    COMMAND_CENTER_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    readyForGoLive,
    readyForFreeze,
    readyForEnterprise,
    summary: `go-live-manifest id=${manifestId} readyForGoLive=${readyForGoLive} readyForFreeze=${readyForFreeze} readyForEnterprise=${readyForEnterprise} confidence=${freeze.confidenceScore}`,
  };
}
