/**
 * V3.7-H13 Enterprise Portal — enterprise ops manifest (static aggregation)
 */

import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { PRODUCTION_DASHBOARD_VERSION } from "../dashboard";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_AUDIT_VERSION } from "../audit";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { buildOpsPortalManifest } from "../ops/ops-portal-manifest";
import { buildGovernanceManifest } from "../governance/governance-manifest";
import { buildReleaseLedgerDto } from "../release-ledger/release-ledger.dto";

export const ENTERPRISE_OPS_MANIFEST_VERSION = "3.7-h13-manifest-1" as const;

export type EnterpriseOpsManifest = {
  version: typeof ENTERPRISE_OPS_MANIFEST_VERSION;
  manifestId: string;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  DASHBOARD_VERSION: typeof PRODUCTION_DASHBOARD_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  AUDIT_VERSION: typeof PRODUCTION_AUDIT_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  readyForOps: boolean;
  readyForGovernance: boolean;
  readyForRelease: boolean;
  summary: string;
};

export function buildEnterpriseOpsManifest(input?: { deploymentId?: string }): EnterpriseOpsManifest {
  const deploymentId = input?.deploymentId ?? "enterprise-ops-manifest";
  const manifestId = `EOM-V37H13-${deploymentId.slice(0, 8)}`;
  const ops = buildOpsPortalManifest({ deploymentId });
  const governance = buildGovernanceManifest({ deploymentId });
  const ledger = buildReleaseLedgerDto({ deploymentId });

  const readyForRelease = ledger.releaseReady && ledger.releasable;

  return {
    version: ENTERPRISE_OPS_MANIFEST_VERSION,
    manifestId,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    DASHBOARD_VERSION: PRODUCTION_DASHBOARD_VERSION,
    GOVERNANCE_VERSION: GOVERNANCE_VERSION,
    AUDIT_VERSION: PRODUCTION_AUDIT_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    readyForOps: ops.readyForOps,
    readyForGovernance: governance.readyForGovernance,
    readyForRelease,
    summary: `enterprise-ops-manifest id=${manifestId} readyForOps=${ops.readyForOps} readyForGovernance=${governance.readyForGovernance} readyForRelease=${readyForRelease}`,
  };
}
