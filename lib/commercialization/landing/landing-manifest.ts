/**
 * V3.7-H17 Enterprise Landing — manifest (static aggregation)
 */

import { COMMAND_CENTER_VERSION } from "../command-center/command-center-manifest";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { buildSaasReadinessSummary } from "./saas-readiness";

export const LANDING_MANIFEST_VERSION = "3.7-h17-manifest-1" as const;
export const LANDING_VERSION = "3.7-h17-foundation-1" as const;

export type LandingManifest = {
  version: typeof LANDING_MANIFEST_VERSION;
  manifestId: string;
  LANDING_VERSION: typeof LANDING_VERSION;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForLanding: boolean;
  readyForDeployment: boolean;
  readyForEnterprise: boolean;
  summary: string;
};

export function buildLandingManifest(input?: { deploymentId?: string }): LandingManifest {
  const deploymentId = input?.deploymentId ?? "landing-manifest";
  const manifestId = `ELM-V37H17-${deploymentId.slice(0, 8)}`;
  const readiness = buildSaasReadinessSummary({ deploymentId });

  const readyForLanding =
    readiness.opsReady &&
    readiness.governanceReady &&
    readiness.auditReady &&
    readiness.releaseReady;

  const readyForDeployment = readiness.deploymentReady && readiness.confidenceScore >= 80;
  const readyForEnterprise =
    readyForLanding && readyForDeployment && readiness.observabilityReady;

  return {
    version: LANDING_MANIFEST_VERSION,
    manifestId,
    LANDING_VERSION,
    COMMAND_CENTER_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    GOVERNANCE_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForLanding,
    readyForDeployment,
    readyForEnterprise,
    summary: `landing-manifest id=${manifestId} readyForLanding=${readyForLanding} readyForDeployment=${readyForDeployment} readyForEnterprise=${readyForEnterprise} confidence=${readiness.confidenceScore}`,
  };
}
