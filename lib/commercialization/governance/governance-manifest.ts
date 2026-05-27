/**
 * V3.7-H11 Enterprise Governance — governance manifest (static aggregation)
 */

import { buildAccessManifest } from "../access/access-manifest";
import { ACCESS_MATRIX_VERSION } from "../access/access-matrix";
import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { PRODUCTION_AUDIT_VERSION } from "../audit";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";

export const GOVERNANCE_MANIFEST_VERSION = "3.7-h11-manifest-1" as const;
export const GOVERNANCE_VERSION = "3.7-h11-foundation-1" as const;

export type GovernanceManifest = {
  version: typeof GOVERNANCE_MANIFEST_VERSION;
  manifestId: string;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  ACCESS_MATRIX_VERSION: typeof ACCESS_MATRIX_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  AUDIT_VERSION: typeof PRODUCTION_AUDIT_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForGovernance: boolean;
  readyForOps: boolean;
  readyForReview: boolean;
  summary: string;
};

export function buildGovernanceManifest(input?: { deploymentId?: string }): GovernanceManifest {
  const deploymentId = input?.deploymentId ?? "governance-manifest";
  const manifestId = `GMF-V37H11-${deploymentId.slice(0, 8)}`;
  const access = buildAccessManifest({ deploymentId });

  const readyForGovernance =
    access.readyForReview &&
    access.readyForOps &&
    access.buildPassed &&
    access.tscPassed &&
    access.verificationPassed;

  return {
    version: GOVERNANCE_MANIFEST_VERSION,
    manifestId,
    GOVERNANCE_VERSION,
    ACCESS_MATRIX_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    AUDIT_VERSION: PRODUCTION_AUDIT_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForGovernance,
    readyForOps: access.readyForOps,
    readyForReview: access.readyForReview,
    summary: `governance-manifest id=${manifestId} readyForGovernance=${readyForGovernance} readyForOps=${access.readyForOps} readyForReview=${access.readyForReview}`,
  };
}
