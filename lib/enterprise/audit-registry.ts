/**
 * EP-1 / WP-17 — Enterprise Audit Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-16.
 * Derives from Review (WP-16).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_REVIEW_REGISTRY_BASELINE,
  getReviewRegistry,
  type ReviewRegistry,
  type ReviewType,
} from "./review-registry";

export const EP_WP17_ID = "WP-17" as const;
export const AUDIT_REGISTRY_CAPABILITY = "AuditRegistry" as const;
export const EP_AUDIT_REGISTRY_VERSION = "ep-1-wp-17-audit-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-16 baseline. */
export const EP_AUDIT_REGISTRY_BASELINE = EP_REVIEW_REGISTRY_BASELINE;

export const AUDIT_TYPES = ["TRAIL", "COMPLIANCE", "SECURITY"] as const;
export type AuditType = (typeof AUDIT_TYPES)[number];

export const AUDIT_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export type AuditRegistry = Readonly<{
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
  auditName: string;
  auditType: AuditType;
  status: AuditStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type AuditSeedDef = Readonly<{
  auditIdSuffix: string;
  auditName: string;
  auditType: AuditType;
}>;

/** Audit templates keyed by WP-16 reviewType (intentionally unsorted). */
const AUDIT_DEFS_BY_REVIEW_TYPE: Readonly<
  Record<ReviewType, readonly AuditSeedDef[]>
> = {
  INITIAL: [
    {
      auditIdSuffix: "trail-init",
      auditName: "Initial Review Trail",
      auditType: "TRAIL",
    },
  ],
  PEER: [
    {
      auditIdSuffix: "compliance-peer",
      auditName: "Peer Compliance Audit",
      auditType: "COMPLIANCE",
    },
    {
      auditIdSuffix: "trail-peer",
      auditName: "Peer Review Trail",
      auditType: "TRAIL",
    },
  ],
  FINAL: [
    {
      auditIdSuffix: "security-final",
      auditName: "Final Security Audit",
      auditType: "SECURITY",
    },
    {
      auditIdSuffix: "compliance-final",
      auditName: "Final Compliance Audit",
      auditType: "COMPLIANCE",
    },
  ],
};

let cachedRegistry: AuditRegistry[] | null = null;

function cloneEntry(row: AuditRegistry): AuditRegistry {
  return { ...row };
}

function sortStable(rows: readonly AuditRegistry[]): AuditRegistry[] {
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
    return a.auditId.localeCompare(b.auditId);
  });
}

function fingerprint(rows: readonly AuditRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.auditName}|${r.auditType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromReviews(
  reviews: readonly ReviewRegistry[],
): AuditRegistry[] {
  const rows: AuditRegistry[] = [];
  for (const review of reviews) {
    const defs = AUDIT_DEFS_BY_REVIEW_TYPE[review.reviewType] ?? [];
    for (const def of defs) {
      const auditId = `aud-${review.reviewId}-${def.auditIdSuffix}`;
      const status: AuditStatus =
        review.status === "ACTIVE" ? "ACTIVE" : review.status;
      rows.push({
        id: `ep.aud.reg.${review.organizationId}.${review.roleId}.${review.permissionId}.${review.policyId}.${review.assignmentId}.${review.notificationId}.${review.alertId}.${review.escalationId}.${review.workflowId}.${review.approvalId}.${review.reviewId}.${auditId}`,
        organizationId: review.organizationId,
        roleId: review.roleId,
        permissionId: review.permissionId,
        policyId: review.policyId,
        assignmentId: review.assignmentId,
        notificationId: review.notificationId,
        alertId: review.alertId,
        escalationId: review.escalationId,
        workflowId: review.workflowId,
        approvalId: review.approvalId,
        reviewId: review.reviewId,
        auditId,
        auditName: def.auditName,
        auditType: def.auditType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Audit Registry from WP-16 reviews.
 */
export function buildAuditRegistry(): AuditRegistry[] {
  const reviews = getReviewRegistry();
  const out = sortStable(seedFromReviews(reviews)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getAuditRegistry(): AuditRegistry[] {
  if (!cachedRegistry) {
    return buildAuditRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function auditRegistryFingerprint(
  rows?: readonly AuditRegistry[],
): string {
  const list = rows ?? getAuditRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearAuditRegistry(): void {
  cachedRegistry = null;
}
