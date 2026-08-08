/**
 * EP-1 / WP-24 — Enterprise Recovery Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-23.
 * Derives from Remedy (WP-23).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_REMEDY_REGISTRY_BASELINE,
  getRemedyRegistry,
  type RemedyRegistry,
  type RemedyType,
} from "./remedy-registry";

export const EP_WP24_ID = "WP-24" as const;
export const RECOVERY_REGISTRY_CAPABILITY = "RecoveryRegistry" as const;
export const EP_RECOVERY_REGISTRY_VERSION =
  "ep-1-wp-24-recovery-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-23 baseline. */
export const EP_RECOVERY_REGISTRY_BASELINE = EP_REMEDY_REGISTRY_BASELINE;

export const RECOVERY_TYPES = ["RESTORE", "FAILOVER", "ROLLBACK"] as const;
export type RecoveryType = (typeof RECOVERY_TYPES)[number];

export const RECOVERY_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

export type RecoveryRegistry = Readonly<{
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
  recoveryName: string;
  recoveryType: RecoveryType;
  status: RecoveryStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RecoverySeedDef = Readonly<{
  recoveryIdSuffix: string;
  recoveryName: string;
  recoveryType: RecoveryType;
}>;

/** Recovery templates keyed by WP-23 remedyType (one per type; scale-safe). */
const RECOVERY_DEFS_BY_REMEDY_TYPE: Readonly<
  Record<RemedyType, readonly RecoverySeedDef[]>
> = {
  PATCH: [
    {
      recoveryIdSuffix: "restore-patch",
      recoveryName: "Patch Restore Recovery",
      recoveryType: "RESTORE",
    },
  ],
  PROCESS: [
    {
      recoveryIdSuffix: "failover-process",
      recoveryName: "Process Failover Recovery",
      recoveryType: "FAILOVER",
    },
  ],
  WAIVER: [
    {
      recoveryIdSuffix: "rollback-waiver",
      recoveryName: "Waiver Rollback Recovery",
      recoveryType: "ROLLBACK",
    },
  ],
};

let cachedRegistry: RecoveryRegistry[] | null = null;

function cloneEntry(row: RecoveryRegistry): RecoveryRegistry {
  return { ...row };
}

function sortStable(rows: readonly RecoveryRegistry[]): RecoveryRegistry[] {
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
    return a.recoveryId.localeCompare(b.recoveryId);
  });
}

function fingerprint(rows: readonly RecoveryRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.issueId}|${r.resolutionId}|${r.remedyId}|${r.recoveryId}|${r.recoveryName}|${r.recoveryType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromRemedies(
  remedies: readonly RemedyRegistry[],
): RecoveryRegistry[] {
  const rows: RecoveryRegistry[] = [];
  for (const remedy of remedies) {
    const defs = RECOVERY_DEFS_BY_REMEDY_TYPE[remedy.remedyType] ?? [];
    for (const def of defs) {
      const recoveryId = `recv-${remedy.remedyId}-${def.recoveryIdSuffix}`;
      const status: RecoveryStatus =
        remedy.status === "ACTIVE" ? "ACTIVE" : remedy.status;
      rows.push({
        id: `ep.recv.reg.${remedy.organizationId}.${remedy.roleId}.${remedy.permissionId}.${remedy.policyId}.${remedy.assignmentId}.${remedy.notificationId}.${remedy.alertId}.${remedy.escalationId}.${remedy.workflowId}.${remedy.approvalId}.${remedy.reviewId}.${remedy.auditId}.${remedy.complianceId}.${remedy.controlId}.${remedy.riskId}.${remedy.issueId}.${remedy.resolutionId}.${remedy.remedyId}.${recoveryId}`,
        organizationId: remedy.organizationId,
        roleId: remedy.roleId,
        permissionId: remedy.permissionId,
        policyId: remedy.policyId,
        assignmentId: remedy.assignmentId,
        notificationId: remedy.notificationId,
        alertId: remedy.alertId,
        escalationId: remedy.escalationId,
        workflowId: remedy.workflowId,
        approvalId: remedy.approvalId,
        reviewId: remedy.reviewId,
        auditId: remedy.auditId,
        complianceId: remedy.complianceId,
        controlId: remedy.controlId,
        riskId: remedy.riskId,
        issueId: remedy.issueId,
        resolutionId: remedy.resolutionId,
        remedyId: remedy.remedyId,
        recoveryId,
        recoveryName: def.recoveryName,
        recoveryType: def.recoveryType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Recovery Registry from WP-23 remedies.
 */
export function buildRecoveryRegistry(): RecoveryRegistry[] {
  const remedies = getRemedyRegistry();
  const out = sortStable(seedFromRemedies(remedies)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getRecoveryRegistry(): RecoveryRegistry[] {
  if (!cachedRegistry) {
    return buildRecoveryRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function recoveryRegistryFingerprint(
  rows?: readonly RecoveryRegistry[],
): string {
  const list = rows ?? getRecoveryRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearRecoveryRegistry(): void {
  cachedRegistry = null;
}
