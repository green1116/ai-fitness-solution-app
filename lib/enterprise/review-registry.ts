/**
 * EP-1 / WP-16 — Enterprise Review Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-15.
 * Derives from Approval (WP-15).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_APPROVAL_REGISTRY_BASELINE,
  getApprovalRegistry,
  type ApprovalRegistry,
  type ApprovalType,
} from "./approval-registry";

export const EP_WP16_ID = "WP-16" as const;
export const REVIEW_REGISTRY_CAPABILITY = "ReviewRegistry" as const;
export const EP_REVIEW_REGISTRY_VERSION =
  "ep-1-wp-16-review-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-15 baseline. */
export const EP_REVIEW_REGISTRY_BASELINE = EP_APPROVAL_REGISTRY_BASELINE;

export const REVIEW_TYPES = [
  "INITIAL",
  "PEER",
  "FINAL",
] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

export const REVIEW_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewRegistry = Readonly<{
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
  reviewName: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ReviewSeedDef = Readonly<{
  reviewIdSuffix: string;
  reviewName: string;
  reviewType: ReviewType;
}>;

/** Review templates keyed by WP-15 approvalType (intentionally unsorted). */
const REVIEW_DEFS_BY_APPROVAL_TYPE: Readonly<
  Record<ApprovalType, readonly ReviewSeedDef[]>
> = {
  SINGLE: [
    {
      reviewIdSuffix: "initial-single",
      reviewName: "Initial Single Review",
      reviewType: "INITIAL",
    },
  ],
  SEQUENTIAL: [
    {
      reviewIdSuffix: "peer-seq",
      reviewName: "Peer Sequential Review",
      reviewType: "PEER",
    },
    {
      reviewIdSuffix: "final-seq",
      reviewName: "Final Sequential Review",
      reviewType: "FINAL",
    },
  ],
  PARALLEL: [
    {
      reviewIdSuffix: "peer-par",
      reviewName: "Peer Parallel Review",
      reviewType: "PEER",
    },
    {
      reviewIdSuffix: "final-par",
      reviewName: "Final Parallel Review",
      reviewType: "FINAL",
    },
  ],
};

let cachedRegistry: ReviewRegistry[] | null = null;

function cloneEntry(row: ReviewRegistry): ReviewRegistry {
  return { ...row };
}

function sortStable(rows: readonly ReviewRegistry[]): ReviewRegistry[] {
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
    return a.reviewId.localeCompare(b.reviewId);
  });
}

function fingerprint(rows: readonly ReviewRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.reviewName}|${r.reviewType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromApprovals(
  approvals: readonly ApprovalRegistry[],
): ReviewRegistry[] {
  const rows: ReviewRegistry[] = [];
  for (const approval of approvals) {
    const defs = REVIEW_DEFS_BY_APPROVAL_TYPE[approval.approvalType] ?? [];
    for (const def of defs) {
      const reviewId = `rev-${approval.approvalId}-${def.reviewIdSuffix}`;
      const status: ReviewStatus =
        approval.status === "ACTIVE" ? "ACTIVE" : approval.status;
      rows.push({
        id: `ep.rev.reg.${approval.organizationId}.${approval.roleId}.${approval.permissionId}.${approval.policyId}.${approval.assignmentId}.${approval.notificationId}.${approval.alertId}.${approval.escalationId}.${approval.workflowId}.${approval.approvalId}.${reviewId}`,
        organizationId: approval.organizationId,
        roleId: approval.roleId,
        permissionId: approval.permissionId,
        policyId: approval.policyId,
        assignmentId: approval.assignmentId,
        notificationId: approval.notificationId,
        alertId: approval.alertId,
        escalationId: approval.escalationId,
        workflowId: approval.workflowId,
        approvalId: approval.approvalId,
        reviewId,
        reviewName: def.reviewName,
        reviewType: def.reviewType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Review Registry from WP-15 approvals.
 */
export function buildReviewRegistry(): ReviewRegistry[] {
  const approvals = getApprovalRegistry();
  const out = sortStable(seedFromApprovals(approvals)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getReviewRegistry(): ReviewRegistry[] {
  if (!cachedRegistry) {
    return buildReviewRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function reviewRegistryFingerprint(
  rows?: readonly ReviewRegistry[],
): string {
  const list = rows ?? getReviewRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearReviewRegistry(): void {
  cachedRegistry = null;
}
