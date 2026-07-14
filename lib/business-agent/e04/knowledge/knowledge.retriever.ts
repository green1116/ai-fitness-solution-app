/**
 * E04-P6 — Business Knowledge Retriever
 */

import {
  listKnowledgeEntities,
  listNeighbors,
} from "./knowledge.graph";
import type {
  KnowledgeEntity,
  KnowledgeHit,
  KnowledgeQuery,
  KnowledgeRetrieveResult,
} from "./knowledge.types";

function scoreEntity(
  entity: KnowledgeEntity,
  query: KnowledgeQuery,
): { score: number; reasons: string[] } | null {
  let score = 0;
  const reasons: string[] = [];

  if (query.kind) {
    if (entity.kind !== query.kind) return null;
    score += 3;
    reasons.push("kind");
  }

  if (query.tags?.length) {
    const matched = query.tags.filter((t) => entity.tags.includes(t));
    if (matched.length === 0) return null;
    score += matched.length * 2;
    reasons.push(`tags:${matched.join(",")}`);
  }

  if (query.text?.trim()) {
    const needle = query.text.trim().toLowerCase();
    const hay = `${entity.name} ${entity.description}`.toLowerCase();
    if (!hay.includes(needle)) return null;
    score += 4;
    reasons.push("text");
  }

  if (score === 0) {
    score = 1;
    reasons.push("all");
  }

  return { score, reasons };
}

export function retrieveKnowledge(
  query: KnowledgeQuery,
): KnowledgeRetrieveResult {
  let pool: KnowledgeEntity[] = listKnowledgeEntities();

  if (query.neighborOf) {
    pool = listNeighbors(query.neighborOf, query.relationKind);
  }

  const hits: KnowledgeHit[] = [];
  for (const entity of pool) {
    // When neighborOf is set, kind/tags/text still apply as filters
    const filteredQuery: KnowledgeQuery = {
      kind: query.kind,
      tags: query.tags,
      text: query.text,
    };
    const scored = scoreEntity(entity, filteredQuery);
    if (!scored) continue;
    const reasons = query.neighborOf
      ? [...scored.reasons, "neighbor"]
      : scored.reasons;
    hits.push({
      entity,
      score: scored.score + (query.neighborOf ? 2 : 0),
      reasons,
      readOnly: true,
    });
  }

  hits.sort(
    (a, b) => b.score - a.score || a.entity.id.localeCompare(b.entity.id),
  );

  const limit = query.limit && query.limit > 0 ? query.limit : hits.length;
  const limited = hits.slice(0, limit);

  return {
    query: Object.freeze({ ...query }),
    hits: Object.freeze([...limited]) as KnowledgeHit[],
    hitCount: limited.length,
    readOnly: true,
  };
}
