/**
 * V3.7-H19 Production Rollout — operational handoff manifest (static aggregation)
 */

import { COMMAND_CENTER_VERSION } from "../command-center/command-center-manifest";
import { LANDING_VERSION } from "../landing/landing-manifest";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { buildLaunchSummary } from "./launch-summary";
import { buildRolloutChecklistConfig } from "./rollout-checklist";

export const HANDOFF_MANIFEST_VERSION = "3.7-h19-handoff-manifest-1" as const;
export const ROLLOUT_VERSION = "3.7-h19-foundation-1" as const;

export type HandoffManifest = {
  version: typeof HANDOFF_MANIFEST_VERSION;
  manifestId: string;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  LANDING_VERSION: typeof LANDING_VERSION;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForLaunch: boolean;
  readyForHandoff: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildHandoffManifest(input?: { deploymentId?: string }): HandoffManifest {
  const deploymentId = input?.deploymentId ?? "handoff-manifest";
  const manifestId = `HFM-V37H19-${deploymentId.slice(0, 8)}`;
  const launch = buildLaunchSummary({ deploymentId });
  const checklist = buildRolloutChecklistConfig({ deploymentId });

  const requiredComplete = checklist.requiredChecks.every((c) => c.status === "complete");
  const readyForLaunch = launch.confidenceScore >= 80 && requiredComplete && launch.deploymentReady;
  const readyForHandoff =
    readyForLaunch &&
    launch.governanceReady &&
    launch.opsReady &&
    launch.releaseReady;
  const readyForEnterprise =
    readyForHandoff && launch.rolloutReady && launch.onboardingReady;

  return {
    version: HANDOFF_MANIFEST_VERSION,
    manifestId,
    ROLLOUT_VERSION,
    LANDING_VERSION,
    COMMAND_CENTER_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    GOVERNANCE_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForLaunch,
    readyForHandoff,
    readyForEnterprise,
    summary: `handoff-manifest id=${manifestId} readyForLaunch=${readyForLaunch} readyForHandoff=${readyForHandoff} readyForEnterprise=${readyForEnterprise} confidence=${launch.confidenceScore} required=${checklist.requiredChecks.length}`,
  };
}
