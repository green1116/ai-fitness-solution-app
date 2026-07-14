/**
 * E04-P5 — Business Memory Retriever
 */

import {
  buildMemoryIndex,
  lookupIndexedIds,
  type MemoryIndex,
} from "./memory.index";
import { getMemoryRecordById, listMemoryRecords } from "./memory.store";
import type {
  MemoryHit,
  MemoryQuery,
  MemoryRecord,
  MemoryRetrieveResult,
} from "./memory.types";

function intersect(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const id of a) {
    if (b.has(id)) out.add(id);
  }
  return out;
}

function scoreRecord(
  record: MemoryRecord,
  query: MemoryQuery,
): { score: number; reasons: string[] } | null {
  let score = 0;
  const reasons: string[] = [];

  if (query.scope) {
    if (record.scope !== query.scope) return null;
    score += 3;
    reasons.push("scope");
  }
  if (query.kind) {
    if (record.kind !== query.kind) return null;
    score += 2;
    reasons.push("kind");
  }
  if (query.ownerId) {
    if (record.ownerId !== query.ownerId) return null;
    score += 3;
    reasons.push("owner");
  }
  if (query.tags?.length) {
    const matched = query.tags.filter((t) => record.tags.includes(t));
    if (matched.length === 0) return null;
    score += matched.length * 2;
    reasons.push(`tags:${matched.join(",")}`);
  }
  if (query.text?.trim()) {
    const needle = query.text.trim().toLowerCase();
    const hay = `${record.title} ${record.content}`.toLowerCase();
    if (!hay.includes(needle)) return null;
    score += 4;
    reasons.push("text");
  }

  if (score === 0) {
    // no filters → include with baseline score
    score = 1;
    reasons.push("all");
  }

  return { score, reasons };
}

export function retrieveMemory(
  query: MemoryQuery,
  index: MemoryIndex = buildMemoryIndex(),
): MemoryRetrieveResult {
  let candidateIds: Set<string> | undefined;

  const narrow = (next: Set<string>) => {
    candidateIds =
      candidateIds === undefined ? next : intersect(candidateIds, next);
  };

  if (query.scope) narrow(lookupIndexedIds(index, "scope", query.scope));
  if (query.kind) narrow(lookupIndexedIds(index, "kind", query.kind));
  if (query.ownerId) narrow(lookupIndexedIds(index, "owner", query.ownerId));
  if (query.tags?.length) {
    for (const tag of query.tags) {
      narrow(lookupIndexedIds(index, "tag", tag));
    }
  }

  const records =
    candidateIds === undefined
      ? listMemoryRecords()
      : [...candidateIds]
          .map((id) => getMemoryRecordById(id))
          .filter((r): r is MemoryRecord => Boolean(r));

  const hits: MemoryHit[] = [];
  for (const record of records) {
    const scored = scoreRecord(record, query);
    if (!scored) continue;
    hits.push({
      record,
      score: scored.score,
      reasons: scored.reasons,
      readOnly: true,
    });
  }

  hits.sort(
    (a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id),
  );

  const limit = query.limit && query.limit > 0 ? query.limit : hits.length;
  const limited = hits.slice(0, limit);

  return {
    query: Object.freeze({ ...query }),
    hits: Object.freeze([...limited]) as MemoryHit[],
    hitCount: limited.length,
    readOnly: true,
  };
}
