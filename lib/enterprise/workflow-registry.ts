/**
 * EP-1 / WP-14 — Enterprise Workflow Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-13.
 * Derives from Escalation (WP-13).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ESCALATION_REGISTRY_BASELINE,
  getEscalationRegistry,
  type EscalationRegistry,
  type EscalationType,
} from "./escalation-registry";

export const EP_WP14_ID = "WP-14" as const;
export const WORKFLOW_REGISTRY_CAPABILITY = "WorkflowRegistry" as const;
export const EP_WORKFLOW_REGISTRY_VERSION =
  "ep-1-wp-14-workflow-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-13 baseline. */
export const EP_WORKFLOW_REGISTRY_BASELINE = EP_ESCALATION_REGISTRY_BASELINE;

export const WORKFLOW_TYPES = [
  "MANAGER_REVIEW",
  "ONCALL_RESPONSE",
  "INCIDENT_RESPONSE",
] as const;
export type WorkflowType = (typeof WORKFLOW_TYPES)[number];

export const WORKFLOW_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export type WorkflowRegistry = Readonly<{
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
  workflowName: string;
  workflowType: WorkflowType;
  status: WorkflowStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type WorkflowSeedDef = Readonly<{
  workflowIdSuffix: string;
  workflowName: string;
  workflowType: WorkflowType;
}>;

/** Workflow templates keyed by WP-13 escalationType (intentionally unsorted). */
const WORKFLOW_DEFS_BY_ESCALATION_TYPE: Readonly<
  Record<EscalationType, readonly WorkflowSeedDef[]>
> = {
  NOTIFY_MANAGER: [
    {
      workflowIdSuffix: "mgr-review",
      workflowName: "Manager Review Workflow",
      workflowType: "MANAGER_REVIEW",
    },
  ],
  PAGE_ONCALL: [
    {
      workflowIdSuffix: "oncall-ack",
      workflowName: "On-Call Acknowledge Workflow",
      workflowType: "ONCALL_RESPONSE",
    },
    {
      workflowIdSuffix: "oncall-handoff",
      workflowName: "On-Call Handoff Workflow",
      workflowType: "ONCALL_RESPONSE",
    },
  ],
  OPEN_INCIDENT: [
    {
      workflowIdSuffix: "incident-triage",
      workflowName: "Incident Triage Workflow",
      workflowType: "INCIDENT_RESPONSE",
    },
    {
      workflowIdSuffix: "incident-resolve",
      workflowName: "Incident Resolve Workflow",
      workflowType: "INCIDENT_RESPONSE",
    },
  ],
};

let cachedRegistry: WorkflowRegistry[] | null = null;

function cloneEntry(row: WorkflowRegistry): WorkflowRegistry {
  return { ...row };
}

function sortStable(rows: readonly WorkflowRegistry[]): WorkflowRegistry[] {
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
    return a.workflowId.localeCompare(b.workflowId);
  });
}

function fingerprint(rows: readonly WorkflowRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.workflowId}|${r.workflowName}|${r.workflowType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromEscalations(
  escalations: readonly EscalationRegistry[],
): WorkflowRegistry[] {
  const rows: WorkflowRegistry[] = [];
  for (const escalation of escalations) {
    const defs =
      WORKFLOW_DEFS_BY_ESCALATION_TYPE[escalation.escalationType] ?? [];
    for (const def of defs) {
      const workflowId = `wf-${escalation.escalationId}-${def.workflowIdSuffix}`;
      const status: WorkflowStatus =
        escalation.status === "ACTIVE" ? "ACTIVE" : escalation.status;
      rows.push({
        id: `ep.wf.reg.${escalation.organizationId}.${escalation.roleId}.${escalation.permissionId}.${escalation.policyId}.${escalation.assignmentId}.${escalation.notificationId}.${escalation.alertId}.${escalation.escalationId}.${workflowId}`,
        organizationId: escalation.organizationId,
        roleId: escalation.roleId,
        permissionId: escalation.permissionId,
        policyId: escalation.policyId,
        assignmentId: escalation.assignmentId,
        notificationId: escalation.notificationId,
        alertId: escalation.alertId,
        escalationId: escalation.escalationId,
        workflowId,
        workflowName: def.workflowName,
        workflowType: def.workflowType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workflow Registry from WP-13 escalations.
 */
export function buildWorkflowRegistry(): WorkflowRegistry[] {
  const escalations = getEscalationRegistry();
  const out = sortStable(seedFromEscalations(escalations)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkflowRegistry(): WorkflowRegistry[] {
  if (!cachedRegistry) {
    return buildWorkflowRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workflowRegistryFingerprint(
  rows?: readonly WorkflowRegistry[],
): string {
  const list = rows ?? getWorkflowRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkflowRegistry(): void {
  cachedRegistry = null;
}
