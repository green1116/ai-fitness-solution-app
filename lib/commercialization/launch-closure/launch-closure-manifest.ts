/**
 * V3.7-H21 Enterprise Launch Closure — manifest (static aggregation)
 */

import { GO_LIVE_VERSION } from "../go-live/go-live-manifest";
import { ROLLOUT_VERSION } from "../rollout/handoff-manifest";
import { LANDING_VERSION } from "../landing/landing-manifest";
import { COMMAND_CENTER_VERSION } from "../command-center/command-center-manifest";
import { buildReadinessClosureSummary } from "./readiness-closure-summary";

export const LAUNCH_CLOSURE_MANIFEST_VERSION = "3.7-h21-manifest-1" as const;
export const LAUNCH_CLOSURE_VERSION = "3.7-h21-foundation-1" as const;

export type LaunchClosureManifest = {
  version: typeof LAUNCH_CLOSURE_MANIFEST_VERSION;
  manifestId: string;
  LAUNCH_CLOSURE_VERSION: typeof LAUNCH_CLOSURE_VERSION;
  GO_LIVE_VERSION: typeof GO_LIVE_VERSION;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  LANDING_VERSION: typeof LANDING_VERSION;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  readyForClosure: boolean;
  readyForArchive: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildLaunchClosureManifest(input?: {
  deploymentId?: string;
}): LaunchClosureManifest {
  const deploymentId = input?.deploymentId ?? "launch-closure-manifest";
  const manifestId = `LCM-V37H21-${deploymentId.slice(0, 8)}`;
  const closure = buildReadinessClosureSummary({ deploymentId });

  const readyForClosure = closure.readyForClosure && closure.confidenceScore >= 80;
  const readyForArchive =
    readyForClosure &&
    closure.governanceCompleted &&
    closure.auditCompleted &&
    closure.releaseCompleted;
  const readyForEnterprise = readyForArchive && closure.rolloutCompleted && closure.opsCompleted;

  return {
    version: LAUNCH_CLOSURE_MANIFEST_VERSION,
    manifestId,
    LAUNCH_CLOSURE_VERSION,
    GO_LIVE_VERSION,
    ROLLOUT_VERSION,
    LANDING_VERSION,
    COMMAND_CENTER_VERSION,
    readyForClosure,
    readyForArchive,
    readyForEnterprise,
    summary: `launch-closure-manifest id=${manifestId} readyForClosure=${readyForClosure} readyForArchive=${readyForArchive} readyForEnterprise=${readyForEnterprise} confidence=${closure.confidenceScore}`,
  };
}
