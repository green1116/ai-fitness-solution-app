/**
 * EP-1 / WP-12 — Enterprise Alert Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-11.
 * Derives from Notification (WP-11).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_NOTIFICATION_REGISTRY_BASELINE,
  getNotificationRegistry,
  type NotificationRegistry,
  type NotificationType,
} from "./notification-registry";

export const EP_WP12_ID = "WP-12" as const;
export const ALERT_REGISTRY_CAPABILITY = "AlertRegistry" as const;
export const EP_ALERT_REGISTRY_VERSION = "ep-1-wp-12-alert-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-11 baseline. */
export const EP_ALERT_REGISTRY_BASELINE = EP_NOTIFICATION_REGISTRY_BASELINE;

export const ALERT_TYPES = [
  "ACCESS_GRANTED",
  "ACCESS_REVOKED",
  "POLICY_DRIFT",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export type AlertRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  assignmentId: string;
  notificationId: string;
  alertId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type AlertSeedDef = Readonly<{
  alertIdSuffix: string;
  alertType: AlertType;
  severity: AlertSeverity;
}>;

/** Alert templates keyed by WP-11 notificationType (intentionally unsorted). */
const ALERT_DEFS_BY_NOTIFICATION_TYPE: Readonly<
  Record<NotificationType, readonly AlertSeedDef[]>
> = {
  ASSIGNMENT_GRANTED: [
    {
      alertIdSuffix: "info-granted",
      alertType: "ACCESS_GRANTED",
      severity: "LOW",
    },
  ],
  ASSIGNMENT_REVOKED: [
    {
      alertIdSuffix: "warn-revoked",
      alertType: "ACCESS_REVOKED",
      severity: "HIGH",
    },
    {
      alertIdSuffix: "info-revoked",
      alertType: "ACCESS_REVOKED",
      severity: "MEDIUM",
    },
  ],
  POLICY_CHANGED: [
    {
      alertIdSuffix: "crit-drift",
      alertType: "POLICY_DRIFT",
      severity: "CRITICAL",
    },
    {
      alertIdSuffix: "high-drift",
      alertType: "POLICY_DRIFT",
      severity: "HIGH",
    },
  ],
};

let cachedRegistry: AlertRegistry[] | null = null;

function cloneEntry(row: AlertRegistry): AlertRegistry {
  return { ...row };
}

function sortStable(rows: readonly AlertRegistry[]): AlertRegistry[] {
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
    return a.alertId.localeCompare(b.alertId);
  });
}

function fingerprint(rows: readonly AlertRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.alertId}|${r.alertType}|${r.severity}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromNotifications(
  notifications: readonly NotificationRegistry[],
): AlertRegistry[] {
  const rows: AlertRegistry[] = [];
  for (const notification of notifications) {
    const defs =
      ALERT_DEFS_BY_NOTIFICATION_TYPE[notification.notificationType] ?? [];
    for (const def of defs) {
      const alertId = `alert-${notification.notificationId}-${def.alertIdSuffix}`;
      const status: AlertStatus =
        notification.status === "ACTIVE" ? "ACTIVE" : notification.status;
      rows.push({
        id: `ep.alert.reg.${notification.organizationId}.${notification.roleId}.${notification.permissionId}.${notification.policyId}.${notification.assignmentId}.${notification.notificationId}.${alertId}`,
        organizationId: notification.organizationId,
        roleId: notification.roleId,
        permissionId: notification.permissionId,
        policyId: notification.policyId,
        assignmentId: notification.assignmentId,
        notificationId: notification.notificationId,
        alertId,
        alertType: def.alertType,
        severity: def.severity,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Alert Registry from WP-11 notifications.
 */
export function buildAlertRegistry(): AlertRegistry[] {
  const notifications = getNotificationRegistry();
  const out = sortStable(seedFromNotifications(notifications)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getAlertRegistry(): AlertRegistry[] {
  if (!cachedRegistry) {
    return buildAlertRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function alertRegistryFingerprint(
  rows?: readonly AlertRegistry[],
): string {
  const list = rows ?? getAlertRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearAlertRegistry(): void {
  cachedRegistry = null;
}
