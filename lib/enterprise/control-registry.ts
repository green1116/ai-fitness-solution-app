/**
 * EP-1 / WP-19 — Enterprise Control Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-18.
 * Derives from Compliance (WP-18).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COMPLIANCE_REGISTRY_BASELINE,
  getComplianceRegistry,
  type ComplianceRegistry,
  type ComplianceType,
} from "./compliance-registry";

export const EP_WP19_ID = "WP-19" as const;
export const CONTROL_REGISTRY_CAPABILITY = "ControlRegistry" as const;
export const EP_CONTROL_REGISTRY_VERSION =
  "ep-1-wp-19-control-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-18 baseline. */
export const EP_CONTROL_REGISTRY_BASELINE = EP_COMPLIANCE_REGISTRY_BASELINE;

export const CONTROL_TYPES = ["PREVENTIVE", "DETECTIVE", "CORRECTIVE"] as const;
export type ControlType = (typeof CONTROL_TYPES)[number];

export const CONTROL_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type ControlStatus = (typeof CONTROL_STATUSES)[number];

export type ControlRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  assignmentId: string;
  notificationId: string;
  alertId: string;
  escalationId: string;
  workflowId: string;
  approvalId: string;
  reviewId: string;
  auditId: string;
  complianceId: string;
  controlId: string;
  controlName: string;
  controlType: ControlType;
  status: ControlStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ControlSeedDef = Readonly<{
  controlIdSuffix: string;
  controlName: string;
  controlType: ControlType;
}>;

/** Control templates keyed by WP-18 complianceType (intentionally unsorted). */
const CONTROL_DEFS_BY_COMPLIANCE_TYPE: Readonly<
  Record<ComplianceType, readonly ControlSeedDef[]>
> = {
  POLICY: [
    {
      controlIdSuffix: "prev-policy",
      controlName: "Policy Preventive Control",
      controlType: "PREVENTIVE",
    },
  ],
  REGULATORY: [
    {
      controlIdSuffix: "det-reg",
      controlName: "Regulatory Detective Control",
      controlType: "DETECTIVE",
    },
    {
      controlIdSuffix: "prev-reg",
      controlName: "Regulatory Preventive Control",
      controlType: "PREVENTIVE",
    },
  ],
  INTERNAL: [
    {
      controlIdSuffix: "corr-int",
      controlName: "Internal Corrective Control",
      controlType: "CORRECTIVE",
    },
    {
      controlIdSuffix: "det-int",
      controlName: "Internal Detective Control",
      controlType: "DETECTIVE",
    },
  ],
};

let cachedRegistry: ControlRegistry[] | null = null;

function cloneEntry(row: ControlRegistry): ControlRegistry {
  return { ...row };
}

function sortStable(rows: readonly ControlRegistry[]): ControlRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    const byPerm = a.permissionId.localeCompare(b.permissionId);
    if (byPerm !== 0) return byPerm;
    const byPolicy = a.policyId.localeCompare(b.policyId);
    if (byPolicy !== 0) return byPolicy;
    const byAssign = a.assignmentId.localeCompare(b.assignmentId);
    if (byAssign !== 0) return byAssign;
    const byNotif = a.notificationId.localeCompare(b.notificationId);
    if (byNotif !== 0) return byNotif;
    const byAlert = a.alertId.localeCompare(b.alertId);
    if (byAlert !== 0) return byAlert;
    const byEsc = a.escalationId.localeCompare(b.escalationId);
    if (byEsc !== 0) return byEsc;
    const byWf = a.workflowId.localeCompare(b.workflowId);
    if (byWf !== 0) return byWf;
    const byAppr = a.approvalId.localeCompare(b.approvalId);
    if (byAppr !== 0) return byAppr;
    const byRev = a.reviewId.localeCompare(b.reviewId);
    if (byRev !== 0) return byRev;
    const byAud = a.auditId.localeCompare(b.auditId);
    if (byAud !== 0) return byAud;
    const byCmp = a.complianceId.localeCompare(b.complianceId);
    if (byCmp !== 0) return byCmp;
    return a.controlId.localeCompare(b.controlId);
  });
}

function fingerprint(rows: readonly ControlRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.controlName}|${r.controlType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromCompliance(
  rowsIn: readonly ComplianceRegistry[],
): ControlRegistry[] {
  const rows: ControlRegistry[] = [];
  for (const compliance of rowsIn) {
    const defs =
      CONTROL_DEFS_BY_COMPLIANCE_TYPE[compliance.complianceType] ?? [];
    for (const def of defs) {
      const controlId = `ctl-${compliance.complianceId}-${def.controlIdSuffix}`;
      const status: ControlStatus =
        compliance.status === "ACTIVE" ? "ACTIVE" : compliance.status;
      rows.push({
        id: `ep.ctl.reg.${compliance.organizationId}.${compliance.roleId}.${compliance.permissionId}.${compliance.policyId}.${compliance.assignmentId}.${compliance.notificationId}.${compliance.alertId}.${compliance.escalationId}.${compliance.workflowId}.${compliance.approvalId}.${compliance.reviewId}.${compliance.auditId}.${compliance.complianceId}.${controlId}`,
        organizationId: compliance.organizationId,
        roleId: compliance.roleId,
        permissionId: compliance.permissionId,
        policyId: compliance.policyId,
        assignmentId: compliance.assignmentId,
        notificationId: compliance.notificationId,
        alertId: compliance.alertId,
        escalationId: compliance.escalationId,
        workflowId: compliance.workflowId,
        approvalId: compliance.approvalId,
        reviewId: compliance.reviewId,
        auditId: compliance.auditId,
        complianceId: compliance.complianceId,
        controlId,
        controlName: def.controlName,
        controlType: def.controlType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Control Registry from WP-18 compliance.
 */
export function buildControlRegistry(): ControlRegistry[] {
  const compliance = getComplianceRegistry();
  const out = sortStable(seedFromCompliance(compliance)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getControlRegistry(): ControlRegistry[] {
  if (!cachedRegistry) {
    return buildControlRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function controlRegistryFingerprint(
  rows?: readonly ControlRegistry[],
): string {
  const list = rows ?? getControlRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearControlRegistry(): void {
  cachedRegistry = null;
}
