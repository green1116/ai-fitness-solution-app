/**
 * EP-1 / WP-11 — Enterprise Notification Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-10.
 * Derives from Assignment (WP-10).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ASSIGNMENT_REGISTRY_BASELINE,
  getAssignmentRegistry,
  type AssignmentRegistry,
} from "./assignment-registry";

export const EP_WP11_ID = "WP-11" as const;
export const NOTIFICATION_REGISTRY_CAPABILITY = "NotificationRegistry" as const;
export const EP_NOTIFICATION_REGISTRY_VERSION =
  "ep-1-wp-11-notification-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-10 baseline. */
export const EP_NOTIFICATION_REGISTRY_BASELINE =
  EP_ASSIGNMENT_REGISTRY_BASELINE;

export const NOTIFICATION_TYPES = [
  "ASSIGNMENT_GRANTED",
  "ASSIGNMENT_REVOKED",
  "POLICY_CHANGED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL", "WEBHOOK"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export type NotificationRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  assignmentId: string;
  notificationId: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type NotificationSeedDef = Readonly<{
  notificationIdSuffix: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
}>;

/**
 * Notification templates derived from assignment binding kind
 * (intentionally unsorted notificationIdSuffix).
 */
const NOTIFICATION_DEFS_BY_BINDING: Readonly<
  Record<string, readonly NotificationSeedDef[]>
> = {
  "bind-primary": [
    {
      notificationIdSuffix: "email-granted",
      notificationType: "ASSIGNMENT_GRANTED",
      channel: "EMAIL",
    },
    {
      notificationIdSuffix: "inapp-granted",
      notificationType: "ASSIGNMENT_GRANTED",
      channel: "IN_APP",
    },
  ],
  "bind-guard": [
    {
      notificationIdSuffix: "webhook-policy",
      notificationType: "POLICY_CHANGED",
      channel: "WEBHOOK",
    },
    {
      notificationIdSuffix: "inapp-revoked",
      notificationType: "ASSIGNMENT_REVOKED",
      channel: "IN_APP",
    },
  ],
};

const DEFAULT_NOTIFICATION_DEFS: readonly NotificationSeedDef[] = [
  {
    notificationIdSuffix: "inapp-granted",
    notificationType: "ASSIGNMENT_GRANTED",
    channel: "IN_APP",
  },
];

let cachedRegistry: NotificationRegistry[] | null = null;

function cloneEntry(row: NotificationRegistry): NotificationRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly NotificationRegistry[],
): NotificationRegistry[] {
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
    return a.notificationId.localeCompare(b.notificationId);
  });
}

function fingerprint(rows: readonly NotificationRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.notificationId}|${r.notificationType}|${r.channel}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function bindingKey(assignmentId: string): string {
  if (assignmentId.includes("bind-guard")) return "bind-guard";
  if (assignmentId.includes("bind-primary")) return "bind-primary";
  return "";
}

function seedFromAssignments(
  assignments: readonly AssignmentRegistry[],
): NotificationRegistry[] {
  const rows: NotificationRegistry[] = [];
  for (const assignment of assignments) {
    const key = bindingKey(assignment.assignmentId);
    const defs =
      (key && NOTIFICATION_DEFS_BY_BINDING[key]) || DEFAULT_NOTIFICATION_DEFS;
    for (const def of defs) {
      const notificationId = `notif-${assignment.assignmentId}-${def.notificationIdSuffix}`;
      const status: NotificationStatus =
        assignment.status === "ACTIVE" ? "ACTIVE" : assignment.status;
      rows.push({
        id: `ep.notif.reg.${assignment.organizationId}.${assignment.roleId}.${assignment.permissionId}.${assignment.policyId}.${assignment.assignmentId}.${notificationId}`,
        organizationId: assignment.organizationId,
        roleId: assignment.roleId,
        permissionId: assignment.permissionId,
        policyId: assignment.policyId,
        assignmentId: assignment.assignmentId,
        notificationId,
        notificationType: def.notificationType,
        channel: def.channel,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Notification Registry from WP-10 assignments.
 */
export function buildNotificationRegistry(): NotificationRegistry[] {
  const assignments = getAssignmentRegistry();
  const out = sortStable(seedFromAssignments(assignments)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getNotificationRegistry(): NotificationRegistry[] {
  if (!cachedRegistry) {
    return buildNotificationRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function notificationRegistryFingerprint(
  rows?: readonly NotificationRegistry[],
): string {
  const list = rows ?? getNotificationRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearNotificationRegistry(): void {
  cachedRegistry = null;
}
