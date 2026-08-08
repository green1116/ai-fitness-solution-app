/**
 * EP-1 / WP-21 — Enterprise Issue Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-20.
 * Derives from Risk (WP-20).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_RISK_REGISTRY_BASELINE,
  getRiskRegistry,
  type RiskRegistry,
  type RiskType,
} from "./risk-registry";

export const EP_WP21_ID = "WP-21" as const;
export const ISSUE_REGISTRY_CAPABILITY = "IssueRegistry" as const;
export const EP_ISSUE_REGISTRY_VERSION = "ep-1-wp-21-issue-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-20 baseline. */
export const EP_ISSUE_REGISTRY_BASELINE = EP_RISK_REGISTRY_BASELINE;

export const ISSUE_TYPES = ["INCIDENT", "DEFECT", "FINDING"] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

export const ISSUE_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export type IssueRegistry = Readonly<{
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
  issueName: string;
  issueType: IssueType;
  status: IssueStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type IssueSeedDef = Readonly<{
  issueIdSuffix: string;
  issueName: string;
  issueType: IssueType;
}>;

/** Issue templates keyed by WP-20 riskType (intentionally unsorted). */
const ISSUE_DEFS_BY_RISK_TYPE: Readonly<
  Record<RiskType, readonly IssueSeedDef[]>
> = {
  OPERATIONAL: [
    {
      issueIdSuffix: "incident-ops",
      issueName: "Operational Incident Issue",
      issueType: "INCIDENT",
    },
  ],
  COMPLIANCE: [
    {
      issueIdSuffix: "finding-comp",
      issueName: "Compliance Finding Issue",
      issueType: "FINDING",
    },
    {
      issueIdSuffix: "defect-comp",
      issueName: "Compliance Defect Issue",
      issueType: "DEFECT",
    },
  ],
  SECURITY: [
    {
      issueIdSuffix: "incident-sec",
      issueName: "Security Incident Issue",
      issueType: "INCIDENT",
    },
    {
      issueIdSuffix: "finding-sec",
      issueName: "Security Finding Issue",
      issueType: "FINDING",
    },
  ],
};

let cachedRegistry: IssueRegistry[] | null = null;

function cloneEntry(row: IssueRegistry): IssueRegistry {
  return { ...row };
}

function sortStable(rows: readonly IssueRegistry[]): IssueRegistry[] {
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
    return a.issueId.localeCompare(b.issueId);
  });
}

function fingerprint(rows: readonly IssueRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.controlId}|${r.riskId}|${r.issueId}|${r.issueName}|${r.issueType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromRisks(risks: readonly RiskRegistry[]): IssueRegistry[] {
  const rows: IssueRegistry[] = [];
  for (const risk of risks) {
    const defs = ISSUE_DEFS_BY_RISK_TYPE[risk.riskType] ?? [];
    for (const def of defs) {
      const issueId = `issue-${risk.riskId}-${def.issueIdSuffix}`;
      const status: IssueStatus =
        risk.status === "ACTIVE" ? "ACTIVE" : risk.status;
      rows.push({
        id: `ep.issue.reg.${risk.organizationId}.${risk.roleId}.${risk.permissionId}.${risk.policyId}.${risk.assignmentId}.${risk.notificationId}.${risk.alertId}.${risk.escalationId}.${risk.workflowId}.${risk.approvalId}.${risk.reviewId}.${risk.auditId}.${risk.complianceId}.${risk.controlId}.${risk.riskId}.${issueId}`,
        organizationId: risk.organizationId,
        roleId: risk.roleId,
        permissionId: risk.permissionId,
        policyId: risk.policyId,
        assignmentId: risk.assignmentId,
        notificationId: risk.notificationId,
        alertId: risk.alertId,
        escalationId: risk.escalationId,
        workflowId: risk.workflowId,
        approvalId: risk.approvalId,
        reviewId: risk.reviewId,
        auditId: risk.auditId,
        complianceId: risk.complianceId,
        controlId: risk.controlId,
        riskId: risk.riskId,
        issueId,
        issueName: def.issueName,
        issueType: def.issueType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Issue Registry from WP-20 risks.
 */
export function buildIssueRegistry(): IssueRegistry[] {
  const risks = getRiskRegistry();
  const out = sortStable(seedFromRisks(risks)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getIssueRegistry(): IssueRegistry[] {
  if (!cachedRegistry) {
    return buildIssueRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function issueRegistryFingerprint(
  rows?: readonly IssueRegistry[],
): string {
  const list = rows ?? getIssueRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearIssueRegistry(): void {
  cachedRegistry = null;
}
