/**
 * EP-3 / WP-2 — Collaboration Thread Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-3 WP-1.
 * Derives from CollaborationContext (WP-1).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_COLLABORATION_CONTEXT_BASELINE,
  getCollaborationContext,
  type CollaborationContext,
  type CollaborationParticipant,
} from "./collaboration-context";

export const EP_3_WP2_ID = "WP-2" as const;
export const COLLABORATION_THREAD_REGISTRY_CAPABILITY =
  "CollaborationThreadRegistry" as const;
export const EP_COLLABORATION_THREAD_REGISTRY_VERSION =
  "ep-3-wp-2-collaboration-thread-registry-1" as const;
/** Reuses Pilot GA + EP-3 WP-1 baseline. */
export const EP_COLLABORATION_THREAD_REGISTRY_BASELINE =
  EP_COLLABORATION_CONTEXT_BASELINE;

export const COLLABORATION_THREAD_TYPES = [
  "OWNER_THREAD",
  "ADMIN_THREAD",
  "MEMBER_THREAD",
  "GUEST_THREAD",
  "GENERAL_THREAD",
] as const;
export type CollaborationThreadType =
  (typeof COLLABORATION_THREAD_TYPES)[number];

export const COLLABORATION_THREAD_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationThreadStatus =
  (typeof COLLABORATION_THREAD_STATUSES)[number];

export type CollaborationThreadRegistry = Readonly<{
  id: string;
  threadId: string;
  workspaceId: string;
  participantId: string;
  threadType: CollaborationThreadType;
  status: CollaborationThreadStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

function threadTypeForParticipant(
  participant: CollaborationParticipant,
): CollaborationThreadType {
  switch (participant.memberType) {
    case "OWNER":
      return "OWNER_THREAD";
    case "ADMIN":
      return "ADMIN_THREAD";
    case "MEMBER":
      return "MEMBER_THREAD";
    case "GUEST":
      return "GUEST_THREAD";
    default:
      return "GENERAL_THREAD";
  }
}

let cachedRegistry: CollaborationThreadRegistry[] | null = null;

function cloneEntry(
  row: CollaborationThreadRegistry,
): CollaborationThreadRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly CollaborationThreadRegistry[],
): CollaborationThreadRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byPart = a.participantId.localeCompare(b.participantId);
    if (byPart !== 0) return byPart;
    return a.threadId.localeCompare(b.threadId);
  });
}

function fingerprint(rows: readonly CollaborationThreadRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.threadId}|${r.workspaceId}|${r.participantId}|${r.threadType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromContexts(
  contexts: readonly CollaborationContext[],
): CollaborationThreadRegistry[] {
  const rows: CollaborationThreadRegistry[] = [];
  for (const ctx of contexts) {
    for (const participant of ctx.participants) {
      const threadType = threadTypeForParticipant(participant);
      const participantId = participant.memberId;
      const threadId = `thread-${ctx.workspaceId}-${participantId}`;
      const status: CollaborationThreadStatus =
        ctx.status === "ACTIVE" && participant.status === "ACTIVE"
          ? "ACTIVE"
          : ctx.status === "SUSPENDED" || participant.status === "SUSPENDED"
            ? "SUSPENDED"
            : "INACTIVE";
      rows.push({
        id: `ep.col.thread.reg.${ctx.workspaceId}.${participantId}.${threadId}`,
        threadId,
        workspaceId: ctx.workspaceId,
        participantId,
        threadType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Collaboration Thread Registry from EP-3 WP-1.
 */
export function buildCollaborationThreadRegistry(): CollaborationThreadRegistry[] {
  const contexts = getCollaborationContext();
  const out = sortStable(seedFromContexts(contexts)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getCollaborationThreadRegistry(): CollaborationThreadRegistry[] {
  if (!cachedRegistry) {
    return buildCollaborationThreadRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationThreadRegistryFingerprint(
  rows?: readonly CollaborationThreadRegistry[],
): string {
  const list = rows ?? getCollaborationThreadRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearCollaborationThreadRegistry(): void {
  cachedRegistry = null;
}
