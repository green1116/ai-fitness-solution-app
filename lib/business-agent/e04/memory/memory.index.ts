/**
 * E04-P5 — Business Memory Index
 * Lightweight inverted indexes over store records
 */

import { listMemoryRecords } from "./memory.store";
import type { MemoryIndexSnapshot, MemoryRecord } from "./memory.types";

export type MemoryIndex = {
  byScope: Map<string, Set<string>>;
  byTag: Map<string, Set<string>>;
  byOwner: Map<string, Set<string>>;
  byKind: Map<string, Set<string>>;
  recordIds: Set<string>;
  readOnly: true;
};

function addToIndex(
  map: Map<string, Set<string>>,
  key: string,
  recordId: string,
): void {
  const bucket = map.get(key) ?? new Set<string>();
  bucket.add(recordId);
  map.set(key, bucket);
}

export function buildMemoryIndex(
  records: MemoryRecord[] = listMemoryRecords(),
): MemoryIndex {
  const byScope = new Map<string, Set<string>>();
  const byTag = new Map<string, Set<string>>();
  const byOwner = new Map<string, Set<string>>();
  const byKind = new Map<string, Set<string>>();
  const recordIds = new Set<string>();

  for (const record of records) {
    recordIds.add(record.id);
    addToIndex(byScope, record.scope, record.id);
    addToIndex(byOwner, record.ownerId, record.id);
    addToIndex(byKind, record.kind, record.id);
    for (const tag of record.tags) {
      addToIndex(byTag, tag, record.id);
    }
  }

  return {
    byScope,
    byTag,
    byOwner,
    byKind,
    recordIds,
    readOnly: true,
  };
}

export function snapshotMemoryIndex(
  index: MemoryIndex = buildMemoryIndex(),
): MemoryIndexSnapshot {
  const countMap = (map: Map<string, Set<string>>): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const [key, value] of map.entries()) {
      out[key] = value.size;
    }
    return out;
  };

  return {
    recordCount: index.recordIds.size,
    byScope: Object.freeze(countMap(index.byScope)),
    byTag: Object.freeze(countMap(index.byTag)),
    byOwner: Object.freeze(countMap(index.byOwner)),
    readOnly: true,
  };
}

export function lookupIndexedIds(
  index: MemoryIndex,
  key: "scope" | "tag" | "owner" | "kind",
  value: string,
): Set<string> {
  switch (key) {
    case "scope":
      return new Set(index.byScope.get(value) ?? []);
    case "tag":
      return new Set(index.byTag.get(value) ?? []);
    case "owner":
      return new Set(index.byOwner.get(value) ?? []);
    case "kind":
      return new Set(index.byKind.get(value) ?? []);
  }
}
