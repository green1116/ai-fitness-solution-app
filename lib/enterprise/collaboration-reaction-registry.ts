/**
 * EP-3 / WP-4 — Collaboration Reaction Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1~WP-3.
 * Derives from CollaborationMessage (WP-3).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE,
  getCollaborationMessageRegistry,
  type CollaborationMessageRegistry,
  type CollaborationMessageType,
} from "./collaboration-message-registry";

export const EP_3_WP4_ID = "WP-4" as const;
export const COLLABORATION_REACTION_REGISTRY_CAPABILITY =
  "CollaborationReactionRegistry" as const;
export const EP_COLLABORATION_REACTION_REGISTRY_VERSION =
  "ep-3-wp-4-collaboration-reaction-registry-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-3 baseline. */
export const EP_COLLABORATION_REACTION_REGISTRY_BASELINE =
  EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE;

export const COLLABORATION_REACTION_TYPES = [
  "ACKNOWLEDGE",
  "APPROVE",
  "COMMENT",
  "FLAG",
  "ACK",
] as const;
export type CollaborationReactionType =
  (typeof COLLABORATION_REACTION_TYPES)[number];

export const COLLABORATION_REACTION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationReactionStatus =
  (typeof COLLABORATION_REACTION_STATUSES)[number];

export type CollaborationReactionRegistry = Readonly<{
  id: string;
  threadId: string;
  workspaceId: string;
  participantId: string;
  messageId: string;
  reactionId: string;
  reactionType: CollaborationReactionType;
  status: CollaborationReactionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ReactionSeedDef = Readonly<{
  reactionIdSuffix: string;
  reactionType: CollaborationReactionType;
}>;

/** One reaction template per WP-3 messageType (scale-safe). */
const REACTION_DEFS_BY_MESSAGE_TYPE: Readonly<
  Record<CollaborationMessageType, readonly ReactionSeedDef[]>
> = {
  ANNOUNCEMENT: [
    {
      reactionIdSuffix: "acknowledge",
      reactionType: "ACKNOWLEDGE",
    },
  ],
  DIRECTIVE: [
    {
      reactionIdSuffix: "approve",
      reactionType: "APPROVE",
    },
  ],
  UPDATE: [
    {
      reactionIdSuffix: "comment",
      reactionType: "COMMENT",
    },
  ],
  NOTE: [
    {
      reactionIdSuffix: "flag",
      reactionType: "FLAG",
    },
  ],
  SYSTEM: [
    {
      reactionIdSuffix: "ack",
      reactionType: "ACK",
    },
  ],
};

let cachedRegistry: CollaborationReactionRegistry[] | null = null;

function cloneEntry(
  row: CollaborationReactionRegistry,
): CollaborationReactionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly CollaborationReactionRegistry[],
): CollaborationReactionRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byPart = a.participantId.localeCompare(b.participantId);
    if (byPart !== 0) return byPart;
    const byThread = a.threadId.localeCompare(b.threadId);
    if (byThread !== 0) return byThread;
    const byMsg = a.messageId.localeCompare(b.messageId);
    if (byMsg !== 0) return byMsg;
    return a.reactionId.localeCompare(b.reactionId);
  });
}

function fingerprint(rows: readonly CollaborationReactionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.threadId}|${r.workspaceId}|${r.participantId}|${r.messageId}|${r.reactionId}|${r.reactionType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromMessages(
  messages: readonly CollaborationMessageRegistry[],
): CollaborationReactionRegistry[] {
  const rows: CollaborationReactionRegistry[] = [];
  for (const message of messages) {
    const defs = REACTION_DEFS_BY_MESSAGE_TYPE[message.messageType] ?? [];
    for (const def of defs) {
      const reactionId = `rxn-${message.messageId}-${def.reactionIdSuffix}`;
      const status: CollaborationReactionStatus =
        message.status === "ACTIVE" ? "ACTIVE" : message.status;
      rows.push({
        id: `ep.col.rxn.reg.${message.workspaceId}.${message.participantId}.${message.threadId}.${message.messageId}.${reactionId}`,
        threadId: message.threadId,
        workspaceId: message.workspaceId,
        participantId: message.participantId,
        messageId: message.messageId,
        reactionId,
        reactionType: def.reactionType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Collaboration Reaction Registry from WP-3 messages.
 */
export function buildCollaborationReactionRegistry(): CollaborationReactionRegistry[] {
  const messages = getCollaborationMessageRegistry();
  const out = sortStable(seedFromMessages(messages)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getCollaborationReactionRegistry(): CollaborationReactionRegistry[] {
  if (!cachedRegistry) {
    return buildCollaborationReactionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationReactionRegistryFingerprint(
  rows?: readonly CollaborationReactionRegistry[],
): string {
  const list = rows ?? getCollaborationReactionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearCollaborationReactionRegistry(): void {
  cachedRegistry = null;
}
