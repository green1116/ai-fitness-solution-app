/**
 * EP-1 / WP-18 — Enterprise Compliance Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-17.
 * Derives from Audit (WP-17).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_AUDIT_REGISTRY_BASELINE,
  getAuditRegistry,
  type AuditRegistry,
  type AuditType,
} from "./audit-registry";

export const EP_WP18_ID = "WP-18" as const;
export const COMPLIANCE_REGISTRY_CAPABILITY = "ComplianceRegistry" as const;
export const EP_COMPLIANCE_REGISTRY_VERSION =
  "ep-1-wp-18-compliance-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-17 baseline. */
export const EP_COMPLIANCE_REGISTRY_BASELINE = EP_AUDIT_REGISTRY_BASELINE;

export const COMPLIANCE_TYPES = ["POLICY", "REGULATORY", "INTERNAL"] as const;
export type ComplianceType = (typeof COMPLIANCE_TYPES)[number];

export const COMPLIANCE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export type ComplianceRegistry = Readonly<{
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
  complianceName: string;
  complianceType: ComplianceType;
  status: ComplianceStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ComplianceSeedDef = Readonly<{
  complianceIdSuffix: string;
  complianceName: string;
  complianceType: ComplianceType;
}>;

/** Compliance templates keyed by WP-17 auditType (intentionally unsorted). */
const COMPLIANCE_DEFS_BY_AUDIT_TYPE: Readonly<
  Record<AuditType, readonly ComplianceSeedDef[]>
> = {
  TRAIL: [
    {
      complianceIdSuffix: "policy-trail",
      complianceName: "Trail Policy Compliance",
      complianceType: "POLICY",
    },
  ],
  COMPLIANCE: [
    {
      complianceIdSuffix: "regulatory-comp",
      complianceName: "Regulatory Compliance Check",
      complianceType: "REGULATORY",
    },
    {
      complianceIdSuffix: "internal-comp",
      complianceName: "Internal Compliance Check",
      complianceType: "INTERNAL",
    },
  ],
  SECURITY: [
    {
      complianceIdSuffix: "regulatory-sec",
      complianceName: "Security Regulatory Compliance",
      complianceType: "REGULATORY",
    },
    {
      complianceIdSuffix: "policy-sec",
      complianceName: "Security Policy Compliance",
      complianceType: "POLICY",
    },
  ],
};

let cachedRegistry: ComplianceRegistry[] | null = null;

function cloneEntry(row: ComplianceRegistry): ComplianceRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly ComplianceRegistry[],
): ComplianceRegistry[] {
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
    return a.complianceId.localeCompare(b.complianceId);
  });
}

function fingerprint(rows: readonly ComplianceRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.reviewId}|${r.auditId}|${r.complianceId}|${r.complianceName}|${r.complianceType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromAudits(
  audits: readonly AuditRegistry[],
): ComplianceRegistry[] {
  const rows: ComplianceRegistry[] = [];
  for (const audit of audits) {
    const defs = COMPLIANCE_DEFS_BY_AUDIT_TYPE[audit.auditType] ?? [];
    for (const def of defs) {
      const complianceId = `cmp-${audit.auditId}-${def.complianceIdSuffix}`;
      const status: ComplianceStatus =
        audit.status === "ACTIVE" ? "ACTIVE" : audit.status;
      rows.push({
        id: `ep.cmp.reg.${audit.organizationId}.${audit.roleId}.${audit.permissionId}.${audit.policyId}.${audit.assignmentId}.${audit.notificationId}.${audit.alertId}.${audit.escalationId}.${audit.workflowId}.${audit.approvalId}.${audit.reviewId}.${audit.auditId}.${complianceId}`,
        organizationId: audit.organizationId,
        roleId: audit.roleId,
        permissionId: audit.permissionId,
        policyId: audit.policyId,
        assignmentId: audit.assignmentId,
        notificationId: audit.notificationId,
        alertId: audit.alertId,
        escalationId: audit.escalationId,
        workflowId: audit.workflowId,
        approvalId: audit.approvalId,
        reviewId: audit.reviewId,
        auditId: audit.auditId,
        complianceId,
        complianceName: def.complianceName,
        complianceType: def.complianceType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Compliance Registry from WP-17 audits.
 */
export function buildComplianceRegistry(): ComplianceRegistry[] {
  const audits = getAuditRegistry();
  const out = sortStable(seedFromAudits(audits)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getComplianceRegistry(): ComplianceRegistry[] {
  if (!cachedRegistry) {
    return buildComplianceRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function complianceRegistryFingerprint(
  rows?: readonly ComplianceRegistry[],
): string {
  const list = rows ?? getComplianceRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearComplianceRegistry(): void {
  cachedRegistry = null;
}
