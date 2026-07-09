/**
 * V100 — Sign-off cache (minimal write for release state / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  PilotSignoffActionEntry,
  PilotSignoffActionType,
  PilotSignoffState,
} from "./signoff.types";

type SignoffCacheEntry = {
  state: PilotSignoffState;
  actions: PilotSignoffActionEntry[];
};

declare global {
  // eslint-disable-next-line no-var
  var __v100SignoffCache: Map<string, SignoffCacheEntry> | undefined;
}

function cache(): Map<string, SignoffCacheEntry> {
  globalThis.__v100SignoffCache ||= new Map();
  return globalThis.__v100SignoffCache;
}

function getOrCreateEntry(organizationId: string): SignoffCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: SignoffCacheEntry = {
    state: { organizationId, releaseStatus: "draft" },
    actions: [],
  };
  cache().set(organizationId, entry);
  return entry;
}

export function getSignoffState(organizationId: string): PilotSignoffState {
  return { ...getOrCreateEntry(organizationId).state };
}

export function updateSignoffState(
  organizationId: string,
  patch: Partial<Omit<PilotSignoffState, "organizationId">>,
): PilotSignoffState {
  const entry = getOrCreateEntry(organizationId);
  entry.state = { ...entry.state, ...patch, organizationId };
  cache().set(organizationId, entry);
  return { ...entry.state };
}

export function appendSignoffAction(input: {
  organizationId: string;
  actorId: string;
  action: PilotSignoffActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): PilotSignoffActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: PilotSignoffActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  entry.actions.push(action);
  cache().set(input.organizationId, entry);
  return action;
}

export function listSignoffActions(organizationId: string): PilotSignoffActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function clearSignoffCacheForTests(): void {
  globalThis.__v100SignoffCache = new Map();
}
