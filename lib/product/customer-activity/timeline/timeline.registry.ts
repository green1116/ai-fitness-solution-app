/**
 * Product Customer Activity — Timeline registry
 */

import { TIMELINE_ENTRY_KINDS } from "../activity/activity.constants";
import type {
  AppendTimelineEntryInput,
  CustomerActivityTimelineEntry,
  TimelineEntryKind,
} from "./timeline.types";

const entries = new Map<string, CustomerActivityTimelineEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(
  entry: CustomerActivityTimelineEntry,
): CustomerActivityTimelineEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function appendTimelineEntry(
  input: AppendTimelineEntryInput,
): CustomerActivityTimelineEntry {
  const customerId = input.customerId.trim();
  const refId = input.refId.trim();
  const title = input.title.trim();
  if (!customerId) throw new Error("timeline.customerId is required");
  if (!refId) throw new Error("timeline.refId is required");
  if (!title) throw new Error("timeline.title is required");
  if (!(TIMELINE_ENTRY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid timeline entry kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("cacttl");
  if (entries.has(id)) {
    throw new Error(`timeline entry already exists: ${id}`);
  }

  const entry: CustomerActivityTimelineEntry = {
    id,
    customerId,
    kind: input.kind,
    refId,
    title,
    detail: `kind=${input.kind} ref=${refId}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function getTimelineEntry(
  id: string,
): CustomerActivityTimelineEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listTimelineEntries(filter?: {
  customerId?: string;
  kind?: TimelineEntryKind;
}): CustomerActivityTimelineEntry[] {
  let result = [...entries.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((e) => e.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearTimelineEntries(): void {
  entries.clear();
}
