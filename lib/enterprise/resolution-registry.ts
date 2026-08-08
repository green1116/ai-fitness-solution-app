/**
 * EP-1 / WP-22 — Enterprise Resolution Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-21.
 * Derives from Issue (WP-21).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ISSUE_REGISTRY_BASELINE,
  getIssueRegistry,
  type IssueRegistry,
  type IssueType,
} from "./issue-registry";

export const EP_WP22_ID = "WP-22" as const;
export const RESOLUTION_REGISTRY_CAPABILITY = "ResolutionRegistry" as const;
export const EP_RESOLUTION_REGISTRY_VERSION =
  "ep-1-wp-22-resolution-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-21 baseline. */
export const EP_RESOLUTION_REGISTRY_BASELINE = EP_ISSUE_REGISTRY_BASELINE;

export const RESOLUTION_TYPES = ["FIX", "MITIGATE", "ACCEPT"] as const;
export type ResolutionType = (typeof RESOLUTION_TYPES)[number];

export const RESOLUTION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type ResolutionStatus = (typeof RESOLUTION_STATUSES)[number];

export type ResolutionRegistry = Readonly<{
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
  resolutionName: string;
  resolutionType: ResolutionType;
  status: ResolutionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ResolutionSeedDef = Readonly<{
  resolutionIdSuffix: string;
  resolutionName: string;
  resolutionType: ResolutionType;
}>;

/** Resolution templates keyed by WP-21 issueType (intentionally unsorted). */
const RESOLUTION_DEFS_BY_ISSUE_TYPE: Readonly<
  Record<IssueType, readonly ResolutionSeedDef[]>
> = {
  INCIDENT: [
    {
      resolutionIdSuffix: "fix-incident",
      resolutionName: "Incident Fix Resolution",
      resolutionType: "FIX",
    },
  ],
  DEFECT: [
    {
      resolutionIdSuffix: "mitigate-defect",
      resolutionName: "Defect Mitigate Resolution",
      resolutionType: "MITIGATE",
    },
    {
      resolutionIdSuffix: "fix-defect",
      resolutionName: "Defect Fix Resolution",
      resolutionType: "FIX",
    },
  ],
  FINDING: [
    {
      resolutionIdSuffix: "accept-finding",
      resolutionName: "Finding Accept Resolution",
      resolutionType: "ACCEPT",
    },
    {
      resolutionIdSuffix: "mitigate-finding",
      resolutionName: "Finding Mitigate Resolution",
      resolutionType: "MITIGATE",
    },
  ],
};

let cachedRegistry: ResolutionRegistry[] | null = null;

function cloneEntry(row: ResolutionRegistry): ResolutionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly ResolutionRegistry[],
): ResolutionRegistry[] {
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
    return a.resolutionId.localeCompare(b.resolutionId);
  });
}

function fingerprint(rows: readonly ResolutionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.issueId}|${r.resolutionId}|${r.resolutionName}|${r.resolutionType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromIssues(
  issues: readonly IssueRegistry[],
): ResolutionRegistry[] {
  const rows: ResolutionRegistry[] = [];
  for (const issue of issues) {
    const defs = RESOLUTION_DEFS_BY_ISSUE_TYPE[issue.issueType] ?? [];
    for (const def of defs) {
      const resolutionId = `res-${issue.issueId}-${def.resolutionIdSuffix}`;
      const status: ResolutionStatus =
        issue.status === "ACTIVE" ? "ACTIVE" : issue.status;
      rows.push({
        id: `ep.res.reg.${issue.organizationId}.${issue.roleId}.${issue.permissionId}.${issue.policyId}.${issue.assignmentId}.${issue.notificationId}.${issue.alertId}.${issue.escalationId}.${issue.workflowId}.${issue.approvalId}.${issue.reviewId}.${issue.auditId}.${issue.complianceId}.${issue.controlId}.${issue.riskId}.${issue.issueId}.${resolutionId}`,
        organizationId: issue.organizationId,
        roleId: issue.roleId,
        permissionId: issue.permissionId,
        policyId: issue.policyId,
        assignmentId: issue.assignmentId,
        notificationId: issue.notificationId,
        alertId: issue.alertId,
        escalationId: issue.escalationId,
        workflowId: issue.workflowId,
        approvalId: issue.approvalId,
        reviewId: issue.reviewId,
        auditId: issue.auditId,
        complianceId: issue.complianceId,
        controlId: issue.controlId,
        riskId: issue.riskId,
        issueId: issue.issueId,
        resolutionId,
        resolutionName: def.resolutionName,
        resolutionType: def.resolutionType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Resolution Registry from WP-21 issues.
 */
export function buildResolutionRegistry(): ResolutionRegistry[] {
  const issues = getIssueRegistry();
  const out = sortStable(seedFromIssues(issues)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getResolutionRegistry(): ResolutionRegistry[] {
  if (!cachedRegistry) {
    return buildResolutionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function resolutionRegistryFingerprint(
  rows?: readonly ResolutionRegistry[],
): string {
  const list = rows ?? getResolutionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearResolutionRegistry(): void {
  cachedRegistry = null;
}
