/**
 * EP-1 / WP-25 — Enterprise Restore Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-24.
 * Derives from Recovery (WP-24).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_RECOVERY_REGISTRY_BASELINE,
  getRecoveryRegistry,
  type RecoveryRegistry,
  type RecoveryType,
} from "./recovery-registry";

export const EP_WP25_ID = "WP-25" as const;
export const RESTORE_REGISTRY_CAPABILITY = "RestoreRegistry" as const;
export const EP_RESTORE_REGISTRY_VERSION =
  "ep-1-wp-25-restore-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-24 baseline. */
export const EP_RESTORE_REGISTRY_BASELINE = EP_RECOVERY_REGISTRY_BASELINE;

export const RESTORE_TYPES = ["FULL", "PARTIAL", "POINT_IN_TIME"] as const;
export type RestoreType = (typeof RESTORE_TYPES)[number];

export const RESTORE_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RestoreStatus = (typeof RESTORE_STATUSES)[number];

export type RestoreRegistry = Readonly<{
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
  issueId: string;
  resolutionId: string;
  remedyId: string;
  recoveryId: string;
  restoreId: string;
  restoreName: string;
  restoreType: RestoreType;
  status: RestoreStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RestoreSeedDef = Readonly<{
  restoreIdSuffix: string;
  restoreName: string;
  restoreType: RestoreType;
}>;

/** Restore templates keyed by WP-24 recoveryType (one per type; scale-safe). */
const RESTORE_DEFS_BY_RECOVERY_TYPE: Readonly<
  Record<RecoveryType, readonly RestoreSeedDef[]>
> = {
  RESTORE: [
    {
      restoreIdSuffix: "full-restore",
      restoreName: "Full Restore Action",
      restoreType: "FULL",
    },
  ],
  FAILOVER: [
    {
      restoreIdSuffix: "partial-failover",
      restoreName: "Partial Failover Restore",
      restoreType: "PARTIAL",
    },
  ],
  ROLLBACK: [
    {
      restoreIdSuffix: "pit-rollback",
      restoreName: "Point-In-Time Rollback Restore",
      restoreType: "POINT_IN_TIME",
    },
  ],
};

let cachedRegistry: RestoreRegistry[] | null = null;

function cloneEntry(row: RestoreRegistry): RestoreRegistry {
  return { ...row };
}

function sortStable(rows: readonly RestoreRegistry[]): RestoreRegistry[] {
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
    const byRisk = a.riskId.localeCompare(b.riskId);
    if (byRisk !== 0) return byRisk;
    const byIssue = a.issueId.localeCompare(b.issueId);
    if (byIssue !== 0) return byIssue;
    const byRes = a.resolutionId.localeCompare(b.resolutionId);
    if (byRes !== 0) return byRes;
    const byRemedy = a.remedyId.localeCompare(b.remedyId);
    if (byRemedy !== 0) return byRemedy;
    const byRecv = a.recoveryId.localeCompare(b.recoveryId);
    if (byRecv !== 0) return byRecv;
    return a.restoreId.localeCompare(b.restoreId);
  });
}

function fingerprint(rows: readonly RestoreRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.issueId}|${r.resolutionId}|${r.remedyId}|${r.recoveryId}|${r.restoreId}|${r.restoreName}|${r.restoreType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromRecoveries(
  recoveries: readonly RecoveryRegistry[],
): RestoreRegistry[] {
  const rows: RestoreRegistry[] = [];
  for (const recovery of recoveries) {
    const defs = RESTORE_DEFS_BY_RECOVERY_TYPE[recovery.recoveryType] ?? [];
    for (const def of defs) {
      const restoreId = `rst-${recovery.recoveryId}-${def.restoreIdSuffix}`;
      const status: RestoreStatus =
        recovery.status === "ACTIVE" ? "ACTIVE" : recovery.status;
      rows.push({
        id: `ep.rst.reg.${recovery.organizationId}.${recovery.roleId}.${recovery.permissionId}.${recovery.policyId}.${recovery.assignmentId}.${recovery.notificationId}.${recovery.alertId}.${recovery.escalationId}.${recovery.workflowId}.${recovery.approvalId}.${recovery.reviewId}.${recovery.auditId}.${recovery.complianceId}.${recovery.controlId}.${recovery.riskId}.${recovery.issueId}.${recovery.resolutionId}.${recovery.remedyId}.${recovery.recoveryId}.${restoreId}`,
        organizationId: recovery.organizationId,
        roleId: recovery.roleId,
        permissionId: recovery.permissionId,
        policyId: recovery.policyId,
        assignmentId: recovery.assignmentId,
        notificationId: recovery.notificationId,
        alertId: recovery.alertId,
        escalationId: recovery.escalationId,
        workflowId: recovery.workflowId,
        approvalId: recovery.approvalId,
        reviewId: recovery.reviewId,
        auditId: recovery.auditId,
        complianceId: recovery.complianceId,
        controlId: recovery.controlId,
        riskId: recovery.riskId,
        issueId: recovery.issueId,
        resolutionId: recovery.resolutionId,
        remedyId: recovery.remedyId,
        recoveryId: recovery.recoveryId,
        restoreId,
        restoreName: def.restoreName,
        restoreType: def.restoreType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Restore Registry from WP-24 recoveries.
 */
export function buildRestoreRegistry(): RestoreRegistry[] {
  const recoveries = getRecoveryRegistry();
  const out = sortStable(seedFromRecoveries(recoveries)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getRestoreRegistry(): RestoreRegistry[] {
  if (!cachedRegistry) {
    return buildRestoreRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function restoreRegistryFingerprint(
  rows?: readonly RestoreRegistry[],
): string {
  const list = rows ?? getRestoreRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearRestoreRegistry(): void {
  cachedRegistry = null;
}
