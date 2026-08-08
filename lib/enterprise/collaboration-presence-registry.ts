/**
 * EP-3 / WP-5 — Collaboration Presence Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1~WP-4.
 * Derives from CollaborationReaction (WP-4).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COLLABORATION_REACTION_REGISTRY_BASELINE,
  getCollaborationReactionRegistry,
  type CollaborationReactionRegistry,
  type CollaborationReactionType,
} from "./collaboration-reaction-registry";

export const EP_3_WP5_ID = "WP-5" as const;
export const COLLABORATION_PRESENCE_REGISTRY_CAPABILITY =
  "CollaborationPresenceRegistry" as const;
export const EP_COLLABORATION_PRESENCE_REGISTRY_VERSION =
  "ep-3-wp-5-collaboration-presence-registry-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-4 baseline. */
export const EP_COLLABORATION_PRESENCE_REGISTRY_BASELINE =
  EP_COLLABORATION_REACTION_REGISTRY_BASELINE;

export const COLLABORATION_PRESENCE_TYPES = [
  "ONLINE",
  "AWAY",
  "BUSY",
  "VIEWING",
  "IDLE",
] as const;
export type CollaborationPresenceType =
  (typeof COLLABORATION_PRESENCE_TYPES)[number];

export const COLLABORATION_PRESENCE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationPresenceStatus =
  (typeof COLLABORATION_PRESENCE_STATUSES)[number];

export type CollaborationPresenceRegistry = Readonly<{
  id: string;
  threadId: string;
  workspaceId: string;
  participantId: string;
  messageId: string;
  reactionId: string;
  presenceId: string;
  presenceType: CollaborationPresenceType;
  status: CollaborationPresenceStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type PresenceSeedDef = Readonly<{
  presenceIdSuffix: string;
  presenceType: CollaborationPresenceType;
}>;

/** One presence template per WP-4 reactionType (scale-safe). */
const PRESENCE_DEFS_BY_REACTION_TYPE: Readonly<
  Record<CollaborationReactionType, readonly PresenceSeedDef[]>
> = {
  ACKNOWLEDGE: [
    {
      presenceIdSuffix: "online",
      presenceType: "ONLINE",
    },
  ],
  APPROVE: [
    {
      presenceIdSuffix: "away",
      presenceType: "AWAY",
    },
  ],
  COMMENT: [
    {
      presenceIdSuffix: "busy",
      presenceType: "BUSY",
    },
  ],
  FLAG: [
    {
      presenceIdSuffix: "viewing",
      presenceType: "VIEWING",
    },
  ],
  ACK: [
    {
      presenceIdSuffix: "idle",
      presenceType: "IDLE",
    },
  ],
};

let cachedRegistry: CollaborationPresenceRegistry[] | null = null;

function cloneEntry(
  row: CollaborationPresenceRegistry,
): CollaborationPresenceRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly CollaborationPresenceRegistry[],
): CollaborationPresenceRegistry[] {
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
    return a.presenceId.localeCompare(b.presenceId);
  });
}

function fingerprint(rows: readonly CollaborationPresenceRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.threadId}|${r.workspaceId}|${r.participantId}|${r.messageId}|${r.reactionId}|${r.presenceId}|${r.presenceType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromReactions(
  reactions: readonly CollaborationReactionRegistry[],
): CollaborationPresenceRegistry[] {
  const rows: CollaborationPresenceRegistry[] = [];
  for (const reaction of reactions) {
    const defs = PRESENCE_DEFS_BY_REACTION_TYPE[reaction.reactionType] ?? [];
    for (const def of defs) {
      const presenceId = `prs-${reaction.reactionId}-${def.presenceIdSuffix}`;
      const status: CollaborationPresenceStatus =
        reaction.status === "ACTIVE" ? "ACTIVE" : reaction.status;
      rows.push({
        id: `ep.col.prs.reg.${reaction.workspaceId}.${reaction.participantId}.${reaction.threadId}.${reaction.messageId}.${reaction.reactionId}.${presenceId}`,
        threadId: reaction.threadId,
        workspaceId: reaction.workspaceId,
        participantId: reaction.participantId,
        messageId: reaction.messageId,
        reactionId: reaction.reactionId,
        presenceId,
        presenceType: def.presenceType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Collaboration Presence Registry from WP-4 reactions.
 */
export function buildCollaborationPresenceRegistry(): CollaborationPresenceRegistry[] {
  const reactions = getCollaborationReactionRegistry();
  const out = sortStable(seedFromReactions(reactions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getCollaborationPresenceRegistry(): CollaborationPresenceRegistry[] {
  if (!cachedRegistry) {
    return buildCollaborationPresenceRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationPresenceRegistryFingerprint(
  rows?: readonly CollaborationPresenceRegistry[],
): string {
  const list = rows ?? getCollaborationPresenceRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearCollaborationPresenceRegistry(): void {
  cachedRegistry = null;
}
