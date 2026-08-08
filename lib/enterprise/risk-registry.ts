/**
 * EP-1 / WP-20 — Enterprise Risk Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-19.
 * Derives from Control (WP-19).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_CONTROL_REGISTRY_BASELINE,
  getControlRegistry,
  type ControlRegistry,
  type ControlType,
} from "./control-registry";

export const EP_WP20_ID = "WP-20" as const;
export const RISK_REGISTRY_CAPABILITY = "RiskRegistry" as const;
export const EP_RISK_REGISTRY_VERSION = "ep-1-wp-20-risk-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-19 baseline. */
export const EP_RISK_REGISTRY_BASELINE = EP_CONTROL_REGISTRY_BASELINE;

export const RISK_TYPES = ["OPERATIONAL", "COMPLIANCE", "SECURITY"] as const;
export type RiskType = (typeof RISK_TYPES)[number];

export const RISK_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];

export type RiskRegistry = Readonly<{
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
  riskId: string;
  riskName: string;
  riskType: RiskType;
  status: RiskStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RiskSeedDef = Readonly<{
  riskIdSuffix: string;
  riskName: string;
  riskType: RiskType;
}>;

/** Risk templates keyed by WP-19 controlType (intentionally unsorted). */
const RISK_DEFS_BY_CONTROL_TYPE: Readonly<
  Record<ControlType, readonly RiskSeedDef[]>
> = {
  PREVENTIVE: [
    {
      riskIdSuffix: "ops-prev",
      riskName: "Preventive Operational Risk",
      riskType: "OPERATIONAL",
    },
  ],
  DETECTIVE: [
    {
      riskIdSuffix: "comp-det",
      riskName: "Detective Compliance Risk",
      riskType: "COMPLIANCE",
    },
    {
      riskIdSuffix: "ops-det",
      riskName: "Detective Operational Risk",
      riskType: "OPERATIONAL",
    },
  ],
  CORRECTIVE: [
    {
      riskIdSuffix: "sec-corr",
      riskName: "Corrective Security Risk",
      riskType: "SECURITY",
    },
    {
      riskIdSuffix: "comp-corr",
      riskName: "Corrective Compliance Risk",
      riskType: "COMPLIANCE",
    },
  ],
};

let cachedRegistry: RiskRegistry[] | null = null;

function cloneEntry(row: RiskRegistry): RiskRegistry {
  return { ...row };
}

function sortStable(rows: readonly RiskRegistry[]): RiskRegistry[] {
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
    const byCtl = a.controlId.localeCompare(b.controlId);
    if (byCtl !== 0) return byCtl;
    return a.riskId.localeCompare(b.riskId);
  });
}

function fingerprint(rows: readonly RiskRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.riskName}|${r.riskType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromControls(
  controls: readonly ControlRegistry[],
): RiskRegistry[] {
  const rows: RiskRegistry[] = [];
  for (const control of controls) {
    const defs = RISK_DEFS_BY_CONTROL_TYPE[control.controlType] ?? [];
    for (const def of defs) {
      const riskId = `risk-${control.controlId}-${def.riskIdSuffix}`;
      const status: RiskStatus =
        control.status === "ACTIVE" ? "ACTIVE" : control.status;
      rows.push({
        id: `ep.risk.reg.${control.organizationId}.${control.roleId}.${control.permissionId}.${control.policyId}.${control.assignmentId}.${control.notificationId}.${control.alertId}.${control.escalationId}.${control.workflowId}.${control.approvalId}.${control.reviewId}.${control.auditId}.${control.complianceId}.${control.controlId}.${riskId}`,
        organizationId: control.organizationId,
        roleId: control.roleId,
        permissionId: control.permissionId,
        policyId: control.policyId,
        assignmentId: control.assignmentId,
        notificationId: control.notificationId,
        alertId: control.alertId,
        escalationId: control.escalationId,
        workflowId: control.workflowId,
        approvalId: control.approvalId,
        reviewId: control.reviewId,
        auditId: control.auditId,
        complianceId: control.complianceId,
        controlId: control.controlId,
        riskId,
        riskName: def.riskName,
        riskType: def.riskType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Risk Registry from WP-19 controls.
 */
export function buildRiskRegistry(): RiskRegistry[] {
  const controls = getControlRegistry();
  const out = sortStable(seedFromControls(controls)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getRiskRegistry(): RiskRegistry[] {
  if (!cachedRegistry) {
    return buildRiskRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function riskRegistryFingerprint(
  rows?: readonly RiskRegistry[],
): string {
  const list = rows ?? getRiskRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearRiskRegistry(): void {
  cachedRegistry = null;
}
