/**
 * EP-3 / WP-7 — Collaboration Snapshot
 * Read-only aggregate over EP-3 WP-1~WP-6. No new registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1~WP-6.
 * Reuses existing get* APIs only.
 */

import {
  EP_COLLABORATION_STATUS_REGISTRY_BASELINE,
  getCollaborationStatusRegistry,
  collaborationStatusRegistryFingerprint,
  type CollaborationStatusRegistry,
} from "./collaboration-status-registry";
import {
  getCollaborationPresenceRegistry,
  collaborationPresenceRegistryFingerprint,
  type CollaborationPresenceRegistry,
} from "./collaboration-presence-registry";
import {
  getCollaborationReactionRegistry,
  collaborationReactionRegistryFingerprint,
  type CollaborationReactionRegistry,
} from "./collaboration-reaction-registry";
import {
  getCollaborationMessageRegistry,
  collaborationMessageRegistryFingerprint,
  type CollaborationMessageRegistry,
} from "./collaboration-message-registry";
import {
  getCollaborationThreadRegistry,
  collaborationThreadRegistryFingerprint,
  type CollaborationThreadRegistry,
} from "./collaboration-thread-registry";
import {
  getCollaborationContext,
  collaborationContextFingerprint,
  type CollaborationContext,
} from "./collaboration-context";

export const EP_3_WP7_ID = "WP-7" as const;
export const COLLABORATION_SNAPSHOT_CAPABILITY =
  "CollaborationSnapshot" as const;
export const EP_COLLABORATION_SNAPSHOT_VERSION =
  "ep-3-wp-7-collaboration-snapshot-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-6 baseline. */
export const EP_COLLABORATION_SNAPSHOT_BASELINE =
  EP_COLLABORATION_STATUS_REGISTRY_BASELINE;

export type CollaborationSnapshot = Readonly<{
  context: readonly CollaborationContext[];
  threads: readonly CollaborationThreadRegistry[];
  messages: readonly CollaborationMessageRegistry[];
  reactions: readonly CollaborationReactionRegistry[];
  presences: readonly CollaborationPresenceRegistry[];
  statuses: readonly CollaborationStatusRegistry[];
}>;

let cachedSnapshot: CollaborationSnapshot | null = null;

function cloneContext(row: CollaborationContext): CollaborationContext {
  return {
    workspaceId: row.workspaceId,
    organizationId: row.organizationId,
    participants: row.participants.map((p) => ({ ...p })),
    roles: row.roles.map((r) => ({ ...r })),
    activities: row.activities.map((a) => ({ ...a })),
    tasks: row.tasks.map((t) => ({ ...t })),
    status: row.status,
  };
}

function cloneSnapshot(snapshot: CollaborationSnapshot): CollaborationSnapshot {
  return {
    context: snapshot.context.map(cloneContext),
    threads: snapshot.threads.map((r) => ({ ...r })),
    messages: snapshot.messages.map((r) => ({ ...r })),
    reactions: snapshot.reactions.map((r) => ({ ...r })),
    presences: snapshot.presences.map((r) => ({ ...r })),
    statuses: snapshot.statuses.map((r) => ({ ...r })),
  };
}

/**
 * Build a read-only Collaboration Snapshot by reusing WP-1~WP-6 get* APIs.
 */
export function buildCollaborationSnapshot(): CollaborationSnapshot {
  const snapshot: CollaborationSnapshot = {
    context: getCollaborationContext(),
    threads: getCollaborationThreadRegistry(),
    messages: getCollaborationMessageRegistry(),
    reactions: getCollaborationReactionRegistry(),
    presences: getCollaborationPresenceRegistry(),
    statuses: getCollaborationStatusRegistry(),
  };
  cachedSnapshot = cloneSnapshot(snapshot);
  return cloneSnapshot(cachedSnapshot);
}

/**
 * Get the last built snapshot, or build if none cached.
 */
export function getCollaborationSnapshot(): CollaborationSnapshot {
  if (!cachedSnapshot) {
    return buildCollaborationSnapshot();
  }
  return cloneSnapshot(cachedSnapshot);
}

/** Stable content fingerprint across all EP-3 WP-1~WP-6 layers. */
export function collaborationSnapshotFingerprint(
  snapshot?: CollaborationSnapshot,
): string {
  const s = snapshot ?? getCollaborationSnapshot();
  return [
    collaborationContextFingerprint(s.context),
    collaborationThreadRegistryFingerprint(s.threads),
    collaborationMessageRegistryFingerprint(s.messages),
    collaborationReactionRegistryFingerprint(s.reactions),
    collaborationPresenceRegistryFingerprint(s.presences),
    collaborationStatusRegistryFingerprint(s.statuses),
  ].join("||");
}

/** Test helper — clears snapshot cache only (not underlying layers). */
export function clearCollaborationSnapshot(): void {
  cachedSnapshot = null;
}
