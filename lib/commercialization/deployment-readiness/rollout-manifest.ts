/**
 * V3.7-H18 Enterprise Rollout — manifest (static aggregation)
 */

import { COMMAND_CENTER_VERSION } from "../command-center/command-center-manifest";
import { LANDING_VERSION } from "../landing/landing-manifest";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { buildRolloutReadinessSummary } from "./rollout-summary";

export const ROLLOUT_MANIFEST_VERSION = "3.7-h18-manifest-1" as const;
export const ROLLOUT_VERSION = "3.7-h18-foundation-1" as const;

export type RolloutManifest = {
  version: typeof ROLLOUT_MANIFEST_VERSION;
  manifestId: string;
  ROLLOUT_VERSION: typeof ROLLOUT_VERSION;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  LANDING_VERSION: typeof LANDING_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForDeployment: boolean;
  readyForRollout: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildRolloutManifest(input?: { deploymentId?: string }): RolloutManifest {
  const deploymentId = input?.deploymentId ?? "rollout-manifest";
  const manifestId = `ERM-V37H18-${deploymentId.slice(0, 8)}`;
  const readiness = buildRolloutReadinessSummary({ deploymentId });

  const readyForDeployment = readiness.deploymentReady && readiness.confidenceScore >= 80;
  const readyForRollout =
    readiness.rolloutReady &&
    readiness.onboardingReady &&
    readiness.governanceReady &&
    readiness.operationalReady;
  const readyForEnterprise =
    readyForDeployment && readyForRollout && readiness.releaseReady;

  return {
    version: ROLLOUT_MANIFEST_VERSION,
    manifestId,
    ROLLOUT_VERSION,
    COMMAND_CENTER_VERSION,
    LANDING_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    GOVERNANCE_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForDeployment,
    readyForRollout,
    readyForEnterprise,
    summary: `rollout-manifest id=${manifestId} readyForDeployment=${readyForDeployment} readyForRollout=${readyForRollout} readyForEnterprise=${readyForEnterprise} confidence=${readiness.confidenceScore}`,
  };
}
