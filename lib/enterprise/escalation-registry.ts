/**
 * EP-1 / WP-13 — Enterprise Escalation Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-12.
 * Derives from Alert (WP-12).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ALERT_REGISTRY_BASELINE,
  getAlertRegistry,
  type AlertRegistry,
  type AlertSeverity,
} from "./alert-registry";

export const EP_WP13_ID = "WP-13" as const;
export const ESCALATION_REGISTRY_CAPABILITY = "EscalationRegistry" as const;
export const EP_ESCALATION_REGISTRY_VERSION =
  "ep-1-wp-13-escalation-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-12 baseline. */
export const EP_ESCALATION_REGISTRY_BASELINE = EP_ALERT_REGISTRY_BASELINE;

export const ESCALATION_TYPES = [
  "NOTIFY_MANAGER",
  "PAGE_ONCALL",
  "OPEN_INCIDENT",
] as const;
export type EscalationType = (typeof ESCALATION_TYPES)[number];

export const ESCALATION_PRIORITIES = ["P3", "P2", "P1", "P0"] as const;
export type EscalationPriority = (typeof ESCALATION_PRIORITIES)[number];

export const ESCALATION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type EscalationStatus = (typeof ESCALATION_STATUSES)[number];

export type EscalationRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  assignmentId: string;
  notificationId: string;
  alertId: string;
  escalationId: string;
  escalationType: EscalationType;
  priority: EscalationPriority;
  status: EscalationStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type EscalationSeedDef = Readonly<{
  escalationIdSuffix: string;
  escalationType: EscalationType;
  priority: EscalationPriority;
}>;

/** Escalation templates keyed by WP-12 alert severity (intentionally unsorted). */
const ESCALATION_DEFS_BY_SEVERITY: Readonly<
  Record<AlertSeverity, readonly EscalationSeedDef[]>
> = {
  LOW: [
    {
      escalationIdSuffix: "notify-mgr",
      escalationType: "NOTIFY_MANAGER",
      priority: "P3",
    },
  ],
  MEDIUM: [
    {
      escalationIdSuffix: "notify-mgr",
      escalationType: "NOTIFY_MANAGER",
      priority: "P2",
    },
  ],
  HIGH: [
    {
      escalationIdSuffix: "page-oncall",
      escalationType: "PAGE_ONCALL",
      priority: "P1",
    },
    {
      escalationIdSuffix: "notify-mgr",
      escalationType: "NOTIFY_MANAGER",
      priority: "P2",
    },
  ],
  CRITICAL: [
    {
      escalationIdSuffix: "open-incident",
      escalationType: "OPEN_INCIDENT",
      priority: "P0",
    },
    {
      escalationIdSuffix: "page-oncall",
      escalationType: "PAGE_ONCALL",
      priority: "P0",
    },
  ],
};

let cachedRegistry: EscalationRegistry[] | null = null;

function cloneEntry(row: EscalationRegistry): EscalationRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly EscalationRegistry[],
): EscalationRegistry[] {
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
    return a.escalationId.localeCompare(b.escalationId);
  });
}

function fingerprint(rows: readonly EscalationRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.escalationId}|${r.escalationType}|${r.priority}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromAlerts(
  alerts: readonly AlertRegistry[],
): EscalationRegistry[] {
  const rows: EscalationRegistry[] = [];
  for (const alert of alerts) {
    const defs = ESCALATION_DEFS_BY_SEVERITY[alert.severity] ?? [];
    for (const def of defs) {
      const escalationId = `esc-${alert.alertId}-${def.escalationIdSuffix}`;
      const status: EscalationStatus =
        alert.status === "ACTIVE" ? "ACTIVE" : alert.status;
      rows.push({
        id: `ep.esc.reg.${alert.organizationId}.${alert.roleId}.${alert.permissionId}.${alert.policyId}.${alert.assignmentId}.${alert.notificationId}.${alert.alertId}.${escalationId}`,
        organizationId: alert.organizationId,
        roleId: alert.roleId,
        permissionId: alert.permissionId,
        policyId: alert.policyId,
        assignmentId: alert.assignmentId,
        notificationId: alert.notificationId,
        alertId: alert.alertId,
        escalationId,
        escalationType: def.escalationType,
        priority: def.priority,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Escalation Registry from WP-12 alerts.
 */
export function buildEscalationRegistry(): EscalationRegistry[] {
  const alerts = getAlertRegistry();
  const out = sortStable(seedFromAlerts(alerts)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getEscalationRegistry(): EscalationRegistry[] {
  if (!cachedRegistry) {
    return buildEscalationRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function escalationRegistryFingerprint(
  rows?: readonly EscalationRegistry[],
): string {
  const list = rows ?? getEscalationRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearEscalationRegistry(): void {
  cachedRegistry = null;
}
