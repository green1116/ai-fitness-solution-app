/**
 * EP-3 / WP-6 — Collaboration Status Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1~WP-5.
 * Derives from CollaborationPresence (WP-5).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE,
  getCollaborationPresenceRegistry,
  type CollaborationPresenceRegistry,
  type CollaborationPresenceType,
} from "./collaboration-presence-registry";

export const EP_3_WP6_ID = "WP-6" as const;
export const COLLABORATION_STATUS_REGISTRY_CAPABILITY =
  "CollaborationStatusRegistry" as const;
export const EP_COLLABORATION_STATUS_REGISTRY_VERSION =
  "ep-3-wp-6-collaboration-status-registry-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-5 baseline. */
export const EP_COLLABORATION_STATUS_REGISTRY_BASELINE =
  EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE;

export const COLLABORATION_STATUS_TYPES = [
  "AVAILABLE",
  "TEMPORARILY_UNAVAILABLE",
  "FOCUSED",
  "OBSERVING",
  "DORMANT",
] as const;
export type CollaborationStatusType =
  (typeof COLLABORATION_STATUS_TYPES)[number];

export const COLLABORATION_STATUS_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationStatusRecordStatus =
  (typeof COLLABORATION_STATUS_STATUSES)[number];

export type CollaborationStatusRegistry = Readonly<{
  id: string;
  threadId: string;
  workspaceId: string;
  participantId: string;
  messageId: string;
  reactionId: string;
  presenceId: string;
  statusId: string;
  statusType: CollaborationStatusType;
  status: CollaborationStatusRecordStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type StatusSeedDef = Readonly<{
  statusIdSuffix: string;
  statusType: CollaborationStatusType;
}>;

/** One status template per WP-5 presenceType (scale-safe). */
const STATUS_DEFS_BY_PRESENCE_TYPE: Readonly<
  Record<CollaborationPresenceType, readonly StatusSeedDef[]>
> = {
  ONLINE: [
    {
      statusIdSuffix: "available",
      statusType: "AVAILABLE",
    },
  ],
  AWAY: [
    {
      statusIdSuffix: "temp-unavailable",
      statusType: "TEMPORARILY_UNAVAILABLE",
    },
  ],
  BUSY: [
    {
      statusIdSuffix: "focused",
      statusType: "FOCUSED",
    },
  ],
  VIEWING: [
    {
      statusIdSuffix: "observing",
      statusType: "OBSERVING",
    },
  ],
  IDLE: [
    {
      statusIdSuffix: "dormant",
      statusType: "DORMANT",
    },
  ],
};

let cachedRegistry: CollaborationStatusRegistry[] | null = null;

function cloneEntry(
  row: CollaborationStatusRegistry,
): CollaborationStatusRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly CollaborationStatusRegistry[],
): CollaborationStatusRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byPart = a.participantId.localeCompare(b.participantId);
    if (byPart !== 0) return byPart;
    const byThread = a.threadId.localeCompare(b.threadId);
    if (byThread !== 0) return byThread;
    const byMsg = a.messageId.localeCompare(b.messageId);
    if (byMsg !== 0) return byMsg;
    const byRxn = a.reactionId.localeCompare(b.reactionId);
    if (byRxn !== 0) return byRxn;
    const byPrs = a.presenceId.localeCompare(b.presenceId);
    if (byPrs !== 0) return byPrs;
    return a.statusId.localeCompare(b.statusId);
  });
}

function fingerprint(rows: readonly CollaborationStatusRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.threadId}|${r.workspaceId}|${r.participantId}|${r.messageId}|${r.reactionId}|${r.presenceId}|${r.statusId}|${r.statusType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromPresence(
  presenceRows: readonly CollaborationPresenceRegistry[],
): CollaborationStatusRegistry[] {
  const rows: CollaborationStatusRegistry[] = [];
  for (const presence of presenceRows) {
    const defs = STATUS_DEFS_BY_PRESENCE_TYPE[presence.presenceType] ?? [];
    for (const def of defs) {
      const statusId = `st-${presence.presenceId}-${def.statusIdSuffix}`;
      const status: CollaborationStatusRecordStatus =
        presence.status === "ACTIVE" ? "ACTIVE" : presence.status;
      rows.push({
        id: `ep.col.st.reg.${presence.workspaceId}.${presence.participantId}.${presence.threadId}.${presence.messageId}.${presence.reactionId}.${presence.presenceId}.${statusId}`,
        threadId: presence.threadId,
        workspaceId: presence.workspaceId,
        participantId: presence.participantId,
        messageId: presence.messageId,
        reactionId: presence.reactionId,
        presenceId: presence.presenceId,
        statusId,
        statusType: def.statusType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Collaboration Status Registry from WP-5 presence.
 */
export function buildCollaborationStatusRegistry(): CollaborationStatusRegistry[] {
  const presenceRows = getCollaborationPresenceRegistry();
  const out = sortStable(seedFromPresence(presenceRows)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getCollaborationStatusRegistry(): CollaborationStatusRegistry[] {
  if (!cachedRegistry) {
    return buildCollaborationStatusRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationStatusRegistryFingerprint(
  rows?: readonly CollaborationStatusRegistry[],
): string {
  const list = rows ?? getCollaborationStatusRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearCollaborationStatusRegistry(): void {
  cachedRegistry = null;
}
