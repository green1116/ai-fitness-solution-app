/**
 * EP-1 / WP-23 — Enterprise Remedy Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-22.
 * Derives from Resolution (WP-22).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_RESOLUTION_REGISTRY_BASELINE,
  getResolutionRegistry,
  type ResolutionRegistry,
  type ResolutionType,
} from "./resolution-registry";

export const EP_WP23_ID = "WP-23" as const;
export const REMEDY_REGISTRY_CAPABILITY = "RemedyRegistry" as const;
export const EP_REMEDY_REGISTRY_VERSION =
  "ep-1-wp-23-remedy-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-22 baseline. */
export const EP_REMEDY_REGISTRY_BASELINE = EP_RESOLUTION_REGISTRY_BASELINE;

export const REMEDY_TYPES = ["PATCH", "PROCESS", "WAIVER"] as const;
export type RemedyType = (typeof REMEDY_TYPES)[number];

export const REMEDY_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RemedyStatus = (typeof REMEDY_STATUSES)[number];

export type RemedyRegistry = Readonly<{
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
  remedyName: string;
  remedyType: RemedyType;
  status: RemedyStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RemedySeedDef = Readonly<{
  remedyIdSuffix: string;
  remedyName: string;
  remedyType: RemedyType;
}>;

/** Remedy templates keyed by WP-22 resolutionType (intentionally unsorted). */
const REMEDY_DEFS_BY_RESOLUTION_TYPE: Readonly<
  Record<ResolutionType, readonly RemedySeedDef[]>
> = {
  FIX: [
    {
      remedyIdSuffix: "patch-fix",
      remedyName: "Fix Patch Remedy",
      remedyType: "PATCH",
    },
  ],
  MITIGATE: [
    {
      remedyIdSuffix: "process-mitigate",
      remedyName: "Mitigate Process Remedy",
      remedyType: "PROCESS",
    },
    {
      remedyIdSuffix: "patch-mitigate",
      remedyName: "Mitigate Patch Remedy",
      remedyType: "PATCH",
    },
  ],
  ACCEPT: [
    {
      remedyIdSuffix: "waiver-accept",
      remedyName: "Accept Waiver Remedy",
      remedyType: "WAIVER",
    },
    {
      remedyIdSuffix: "process-accept",
      remedyName: "Accept Process Remedy",
      remedyType: "PROCESS",
    },
  ],
};

let cachedRegistry: RemedyRegistry[] | null = null;

function cloneEntry(row: RemedyRegistry): RemedyRegistry {
  return { ...row };
}

function sortStable(rows: readonly RemedyRegistry[]): RemedyRegistry[] {
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
    return a.remedyId.localeCompare(b.remedyId);
  });
}

function fingerprint(rows: readonly RemedyRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.issueId}|${r.resolutionId}|${r.remedyId}|${r.remedyName}|${r.remedyType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromResolutions(
  resolutions: readonly ResolutionRegistry[],
): RemedyRegistry[] {
  const rows: RemedyRegistry[] = [];
  for (const resolution of resolutions) {
    const defs =
      REMEDY_DEFS_BY_RESOLUTION_TYPE[resolution.resolutionType] ?? [];
    for (const def of defs) {
      const remedyId = `remedy-${resolution.resolutionId}-${def.remedyIdSuffix}`;
      const status: RemedyStatus =
        resolution.status === "ACTIVE" ? "ACTIVE" : resolution.status;
      rows.push({
        id: `ep.remedy.reg.${resolution.organizationId}.${resolution.roleId}.${resolution.permissionId}.${resolution.policyId}.${resolution.assignmentId}.${resolution.notificationId}.${resolution.alertId}.${resolution.escalationId}.${resolution.workflowId}.${resolution.approvalId}.${resolution.reviewId}.${resolution.auditId}.${resolution.complianceId}.${resolution.controlId}.${resolution.riskId}.${resolution.issueId}.${resolution.resolutionId}.${remedyId}`,
        organizationId: resolution.organizationId,
        roleId: resolution.roleId,
        permissionId: resolution.permissionId,
        policyId: resolution.policyId,
        assignmentId: resolution.assignmentId,
        notificationId: resolution.notificationId,
        alertId: resolution.alertId,
        escalationId: resolution.escalationId,
        workflowId: resolution.workflowId,
        approvalId: resolution.approvalId,
        reviewId: resolution.reviewId,
        auditId: resolution.auditId,
        complianceId: resolution.complianceId,
        controlId: resolution.controlId,
        riskId: resolution.riskId,
        issueId: resolution.issueId,
        resolutionId: resolution.resolutionId,
        remedyId,
        remedyName: def.remedyName,
        remedyType: def.remedyType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Remedy Registry from WP-22 resolutions.
 */
export function buildRemedyRegistry(): RemedyRegistry[] {
  const resolutions = getResolutionRegistry();
  const out = sortStable(seedFromResolutions(resolutions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getRemedyRegistry(): RemedyRegistry[] {
  if (!cachedRegistry) {
    return buildRemedyRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function remedyRegistryFingerprint(
  rows?: readonly RemedyRegistry[],
): string {
  const list = rows ?? getRemedyRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearRemedyRegistry(): void {
  cachedRegistry = null;
}
