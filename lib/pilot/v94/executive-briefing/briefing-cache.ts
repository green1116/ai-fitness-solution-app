/**
 * V94 — Briefing cache (minimal write for packs / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  BriefingActionEntry,
  BriefingActionType,
  BriefingPack,
} from "./briefing.types";

type BriefingCacheEntry = {
  organizationId: string;
  packs: BriefingPack[];
  actions: BriefingActionEntry[];
};

declare global {
  // eslint-disable-next-line no-var
  var __v94BriefingCache: Map<string, BriefingCacheEntry> | undefined;
}

function cache(): Map<string, BriefingCacheEntry> {
  globalThis.__v94BriefingCache ||= new Map();
  return globalThis.__v94BriefingCache;
}

function getOrCreateEntry(organizationId: string): BriefingCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: BriefingCacheEntry = {
    organizationId,
    packs: [],
    actions: [],
  };
  cache().set(organizationId, entry);
  return entry;
}

export function listBriefingPacks(organizationId: string): BriefingPack[] {
  return getOrCreateEntry(organizationId).packs.sort((a, b) =>
    b.generatedAt.localeCompare(a.generatedAt),
  );
}

export function getBriefingPack(
  organizationId: string,
  packId: string,
): BriefingPack | null {
  return listBriefingPacks(organizationId).find((p) => p.id === packId) ?? null;
}

export function saveBriefingPack(pack: BriefingPack): BriefingPack {
  const entry = getOrCreateEntry(pack.organizationId);
  const idx = entry.packs.findIndex((p) => p.id === pack.id);
  if (idx >= 0) entry.packs[idx] = pack;
  else entry.packs.push(pack);
  cache().set(pack.organizationId, entry);
  return pack;
}

export function appendBriefingAction(input: {
  organizationId: string;
  actorId: string;
  action: BriefingActionType;
  briefingId?: string;
  sessionId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): BriefingActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: BriefingActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    briefingId: input.briefingId,
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  entry.actions.push(action);
  cache().set(input.organizationId, entry);
  return action;
}

export function listBriefingActions(organizationId: string): BriefingActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function listPackActions(
  organizationId: string,
  packId: string,
): BriefingActionEntry[] {
  return listBriefingActions(organizationId).filter((a) => a.briefingId === packId);
}

export function clearBriefingCacheForTests(): void {
  globalThis.__v94BriefingCache = new Map();
}
