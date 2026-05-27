/**
 * V3.7-H15 Enterprise Command Center — manifest (static aggregation)
 */

import { PRODUCTION_OPS_PORTAL_VERSION } from "../ops";
import { PRODUCTION_DASHBOARD_VERSION } from "../dashboard";
import { GOVERNANCE_VERSION } from "../governance/governance-manifest";
import { PRODUCTION_AUDIT_VERSION } from "../audit";
import { PRODUCTION_RELEASE_LEDGER_VERSION } from "../release-ledger";
import { ACCESS_MATRIX_VERSION } from "../access/access-matrix";
import { buildCommandCenterSummary } from "./command-center-summary";

export const COMMAND_CENTER_MANIFEST_VERSION = "3.7-h15-manifest-1" as const;
export const COMMAND_CENTER_VERSION = "3.7-h15-foundation-1" as const;

export type CommandCenterManifest = {
  version: typeof COMMAND_CENTER_MANIFEST_VERSION;
  manifestId: string;
  COMMAND_CENTER_VERSION: typeof COMMAND_CENTER_VERSION;
  OPS_PORTAL_VERSION: typeof PRODUCTION_OPS_PORTAL_VERSION;
  DASHBOARD_VERSION: typeof PRODUCTION_DASHBOARD_VERSION;
  GOVERNANCE_VERSION: typeof GOVERNANCE_VERSION;
  AUDIT_VERSION: typeof PRODUCTION_AUDIT_VERSION;
  RELEASE_LEDGER_VERSION: typeof PRODUCTION_RELEASE_LEDGER_VERSION;
  ACCESS_MATRIX_VERSION: typeof ACCESS_MATRIX_VERSION;
  readyForCommandCenter: boolean;
  readyForOps: boolean;
  readyForGovernance: boolean;
  readyForRelease: boolean;
  summary: string;
};

export function buildCommandCenterManifest(input?: { deploymentId?: string }): CommandCenterManifest {
  const deploymentId = input?.deploymentId ?? "command-center-manifest";
  const manifestId = `CCM-V37H15-${deploymentId.slice(0, 8)}`;
  const summaries = buildCommandCenterSummary({ deploymentId });
  const readiness = summaries.readinessSummary;

  const readyForCommandCenter =
    readiness.readyForOps &&
    readiness.readyForDashboard &&
    readiness.readyForGovernance &&
    readiness.readyForRelease &&
    readiness.readyForAudit &&
    readiness.readyForAccess;

  return {
    version: COMMAND_CENTER_MANIFEST_VERSION,
    manifestId,
    COMMAND_CENTER_VERSION,
    OPS_PORTAL_VERSION: PRODUCTION_OPS_PORTAL_VERSION,
    DASHBOARD_VERSION: PRODUCTION_DASHBOARD_VERSION,
    GOVERNANCE_VERSION: GOVERNANCE_VERSION,
    AUDIT_VERSION: PRODUCTION_AUDIT_VERSION,
    RELEASE_LEDGER_VERSION: PRODUCTION_RELEASE_LEDGER_VERSION,
    ACCESS_MATRIX_VERSION,
    readyForCommandCenter,
    readyForOps: readiness.readyForOps,
    readyForGovernance: readiness.readyForGovernance,
    readyForRelease: readiness.readyForRelease,
    summary: `command-center-manifest id=${manifestId} readyForCommandCenter=${readyForCommandCenter} readyForOps=${readiness.readyForOps} readyForGovernance=${readiness.readyForGovernance} readyForRelease=${readiness.readyForRelease}`,
  };
}
