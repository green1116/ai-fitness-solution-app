/**
 * EP-3 / WP-3 — Collaboration Message Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1~WP-2.
 * Derives from CollaborationThread (WP-2).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COLLABORATION_THREAD_REGISTRY_BASELINE,
  getCollaborationThreadRegistry,
  type CollaborationThreadRegistry,
  type CollaborationThreadType,
} from "./collaboration-thread-registry";

export const EP_3_WP3_ID = "WP-3" as const;
export const COLLABORATION_MESSAGE_REGISTRY_CAPABILITY =
  "CollaborationMessageRegistry" as const;
export const EP_COLLABORATION_MESSAGE_REGISTRY_VERSION =
  "ep-3-wp-3-collaboration-message-registry-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-2 baseline. */
export const EP_COLLABORATION_MESSAGE_REGISTRY_BASELINE =
  EP_COLLABORATION_THREAD_REGISTRY_BASELINE;

export const COLLABORATION_MESSAGE_TYPES = [
  "ANNOUNCEMENT",
  "DIRECTIVE",
  "UPDATE",
  "NOTE",
  "SYSTEM",
] as const;
export type CollaborationMessageType =
  (typeof COLLABORATION_MESSAGE_TYPES)[number];

export const COLLABORATION_MESSAGE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationMessageStatus =
  (typeof COLLABORATION_MESSAGE_STATUSES)[number];

export type CollaborationMessageRegistry = Readonly<{
  id: string;
  threadId: string;
  workspaceId: string;
  participantId: string;
  messageId: string;
  messageType: CollaborationMessageType;
  content: string;
  status: CollaborationMessageStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type MessageSeedDef = Readonly<{
  messageIdSuffix: string;
  messageType: CollaborationMessageType;
  content: string;
}>;

/** One message template per WP-2 threadType (scale-safe). */
const MESSAGE_DEFS_BY_THREAD_TYPE: Readonly<
  Record<CollaborationThreadType, readonly MessageSeedDef[]>
> = {
  OWNER_THREAD: [
    {
      messageIdSuffix: "announce",
      messageType: "ANNOUNCEMENT",
      content: "Owner announcement for collaboration thread",
    },
  ],
  ADMIN_THREAD: [
    {
      messageIdSuffix: "directive",
      messageType: "DIRECTIVE",
      content: "Admin directive for collaboration thread",
    },
  ],
  MEMBER_THREAD: [
    {
      messageIdSuffix: "update",
      messageType: "UPDATE",
      content: "Member update for collaboration thread",
    },
  ],
  GUEST_THREAD: [
    {
      messageIdSuffix: "note",
      messageType: "NOTE",
      content: "Guest note for collaboration thread",
    },
  ],
  GENERAL_THREAD: [
    {
      messageIdSuffix: "system",
      messageType: "SYSTEM",
      content: "System message for collaboration thread",
    },
  ],
};

let cachedRegistry: CollaborationMessageRegistry[] | null = null;

function cloneEntry(
  row: CollaborationMessageRegistry,
): CollaborationMessageRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly CollaborationMessageRegistry[],
): CollaborationMessageRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byPart = a.participantId.localeCompare(b.participantId);
    if (byPart !== 0) return byPart;
    const byThread = a.threadId.localeCompare(b.threadId);
    if (byThread !== 0) return byThread;
    return a.messageId.localeCompare(b.messageId);
  });
}

function fingerprint(rows: readonly CollaborationMessageRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.threadId}|${r.workspaceId}|${r.participantId}|${r.messageId}|${r.messageType}|${r.content}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromThreads(
  threads: readonly CollaborationThreadRegistry[],
): CollaborationMessageRegistry[] {
  const rows: CollaborationMessageRegistry[] = [];
  for (const thread of threads) {
    const defs = MESSAGE_DEFS_BY_THREAD_TYPE[thread.threadType] ?? [];
    for (const def of defs) {
      const messageId = `msg-${thread.threadId}-${def.messageIdSuffix}`;
      const status: CollaborationMessageStatus =
        thread.status === "ACTIVE" ? "ACTIVE" : thread.status;
      rows.push({
        id: `ep.col.msg.reg.${thread.workspaceId}.${thread.participantId}.${thread.threadId}.${messageId}`,
        threadId: thread.threadId,
        workspaceId: thread.workspaceId,
        participantId: thread.participantId,
        messageId,
        messageType: def.messageType,
        content: def.content,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Collaboration Message Registry from WP-2 threads.
 */
export function buildCollaborationMessageRegistry(): CollaborationMessageRegistry[] {
  const threads = getCollaborationThreadRegistry();
  const out = sortStable(seedFromThreads(threads)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getCollaborationMessageRegistry(): CollaborationMessageRegistry[] {
  if (!cachedRegistry) {
    return buildCollaborationMessageRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationMessageRegistryFingerprint(
  rows?: readonly CollaborationMessageRegistry[],
): string {
  const list = rows ?? getCollaborationMessageRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearCollaborationMessageRegistry(): void {
  cachedRegistry = null;
}
