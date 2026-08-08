/**
 * EP-1 / WP-15 — Enterprise Approval Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-14.
 * Derives from Workflow (WP-14).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKFLOW_REGISTRY_BASELINE,
  getWorkflowRegistry,
  type WorkflowRegistry,
  type WorkflowType,
} from "./workflow-registry";

export const EP_WP15_ID = "WP-15" as const;
export const APPROVAL_REGISTRY_CAPABILITY = "ApprovalRegistry" as const;
export const EP_APPROVAL_REGISTRY_VERSION =
  "ep-1-wp-15-approval-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-14 baseline. */
export const EP_APPROVAL_REGISTRY_BASELINE = EP_WORKFLOW_REGISTRY_BASELINE;

export const APPROVAL_TYPES = [
  "SINGLE",
  "SEQUENTIAL",
  "PARALLEL",
] as const;
export type ApprovalType = (typeof APPROVAL_TYPES)[number];

export const APPROVAL_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ApprovalRegistry = Readonly<{
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
  approvalName: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ApprovalSeedDef = Readonly<{
  approvalIdSuffix: string;
  approvalName: string;
  approvalType: ApprovalType;
}>;

/** Approval templates keyed by WP-14 workflowType (intentionally unsorted). */
const APPROVAL_DEFS_BY_WORKFLOW_TYPE: Readonly<
  Record<WorkflowType, readonly ApprovalSeedDef[]>
> = {
  MANAGER_REVIEW: [
    {
      approvalIdSuffix: "single-mgr",
      approvalName: "Manager Single Approval",
      approvalType: "SINGLE",
    },
  ],
  ONCALL_RESPONSE: [
    {
      approvalIdSuffix: "seq-oncall",
      approvalName: "On-Call Sequential Approval",
      approvalType: "SEQUENTIAL",
    },
    {
      approvalIdSuffix: "single-ack",
      approvalName: "On-Call Ack Approval",
      approvalType: "SINGLE",
    },
  ],
  INCIDENT_RESPONSE: [
    {
      approvalIdSuffix: "par-incident",
      approvalName: "Incident Parallel Approval",
      approvalType: "PARALLEL",
    },
    {
      approvalIdSuffix: "seq-incident",
      approvalName: "Incident Sequential Approval",
      approvalType: "SEQUENTIAL",
    },
  ],
};

let cachedRegistry: ApprovalRegistry[] | null = null;

function cloneEntry(row: ApprovalRegistry): ApprovalRegistry {
  return { ...row };
}

function sortStable(rows: readonly ApprovalRegistry[]): ApprovalRegistry[] {
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
    return a.approvalId.localeCompare(b.approvalId);
  });
}

function fingerprint(rows: readonly ApprovalRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.approvalId}|${r.approvalName}|${r.approvalType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromWorkflows(
  workflows: readonly WorkflowRegistry[],
): ApprovalRegistry[] {
  const rows: ApprovalRegistry[] = [];
  for (const workflow of workflows) {
    const defs = APPROVAL_DEFS_BY_WORKFLOW_TYPE[workflow.workflowType] ?? [];
    for (const def of defs) {
      const approvalId = `appr-${workflow.workflowId}-${def.approvalIdSuffix}`;
      const status: ApprovalStatus =
        workflow.status === "ACTIVE" ? "ACTIVE" : workflow.status;
      rows.push({
        id: `ep.appr.reg.${workflow.organizationId}.${workflow.roleId}.${workflow.permissionId}.${workflow.policyId}.${workflow.assignmentId}.${workflow.notificationId}.${workflow.alertId}.${workflow.escalationId}.${workflow.workflowId}.${approvalId}`,
        organizationId: workflow.organizationId,
        roleId: workflow.roleId,
        permissionId: workflow.permissionId,
        policyId: workflow.policyId,
        assignmentId: workflow.assignmentId,
        notificationId: workflow.notificationId,
        alertId: workflow.alertId,
        escalationId: workflow.escalationId,
        workflowId: workflow.workflowId,
        approvalId,
        approvalName: def.approvalName,
        approvalType: def.approvalType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Approval Registry from WP-14 workflows.
 */
export function buildApprovalRegistry(): ApprovalRegistry[] {
  const workflows = getWorkflowRegistry();
  const out = sortStable(seedFromWorkflows(workflows)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getApprovalRegistry(): ApprovalRegistry[] {
  if (!cachedRegistry) {
    return buildApprovalRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function approvalRegistryFingerprint(
  rows?: readonly ApprovalRegistry[],
): string {
  const list = rows ?? getApprovalRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearApprovalRegistry(): void {
  cachedRegistry = null;
}
