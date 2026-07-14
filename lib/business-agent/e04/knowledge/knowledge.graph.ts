/**
 * E04-P6 — Business Knowledge Graph
 * In-memory entity/relation store
 */

import {
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_RELATION_KINDS,
} from "./knowledge.constants";
import type {
  KnowledgeEntity,
  KnowledgeEntityKind,
  KnowledgeGraphSnapshot,
  KnowledgeRelation,
  KnowledgeRelationKind,
} from "./knowledge.types";

const entities = new Map<string, KnowledgeEntity>();
const relations = new Map<string, KnowledgeRelation>();

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function resetKnowledgeGraph(): void {
  entities.clear();
  relations.clear();
}

export function getKnowledgeEntityById(
  id: string,
): KnowledgeEntity | undefined {
  return entities.get(id);
}

export function listKnowledgeEntities(): KnowledgeEntity[] {
  return [...entities.values()];
}

export function listKnowledgeRelations(): KnowledgeRelation[] {
  return [...relations.values()];
}

export function upsertKnowledgeEntity(input: {
  id?: string;
  kind: KnowledgeEntityKind;
  name: string;
  description: string;
  tags?: string[];
  memoryRef?: string;
  attributes?: Readonly<Record<string, unknown>>;
}): KnowledgeEntity {
  if (!(KNOWLEDGE_ENTITY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid entity kind: ${input.kind}`);
  }
  if (!input.name.trim()) throw new Error("entity.name is required");
  if (!input.description.trim()) {
    throw new Error("entity.description is required");
  }

  const id = input.id?.trim() || createId("know");
  const entity: KnowledgeEntity = {
    id,
    kind: input.kind,
    name: input.name.trim(),
    description: input.description.trim(),
    tags: Object.freeze(
      [...new Set((input.tags ?? []).map((t) => t.trim()).filter(Boolean))],
    ) as string[],
    memoryRef: input.memoryRef?.trim() || undefined,
    attributes: Object.freeze({ ...(input.attributes ?? {}) }),
    readOnly: true,
  };

  entities.set(id, entity);
  return entity;
}

export function linkKnowledgeRelation(input: {
  id?: string;
  kind: KnowledgeRelationKind;
  fromId: string;
  toId: string;
  label: string;
  attributes?: Readonly<Record<string, unknown>>;
}): KnowledgeRelation {
  if (!(KNOWLEDGE_RELATION_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid relation kind: ${input.kind}`);
  }
  if (!input.fromId.trim() || !input.toId.trim()) {
    throw new Error("fromId and toId are required");
  }
  if (!input.label.trim()) throw new Error("relation.label is required");
  if (!entities.has(input.fromId)) {
    throw new Error(`unknown from entity: ${input.fromId}`);
  }
  if (!entities.has(input.toId)) {
    throw new Error(`unknown to entity: ${input.toId}`);
  }

  const id = input.id?.trim() || createId("krel");
  const relation: KnowledgeRelation = {
    id,
    kind: input.kind,
    fromId: input.fromId,
    toId: input.toId,
    label: input.label.trim(),
    attributes: Object.freeze({ ...(input.attributes ?? {}) }),
    readOnly: true,
  };

  relations.set(id, relation);
  return relation;
}

export function listNeighbors(
  entityId: string,
  relationKind?: KnowledgeRelationKind,
): KnowledgeEntity[] {
  const out: KnowledgeEntity[] = [];
  for (const relation of relations.values()) {
    if (relationKind && relation.kind !== relationKind) continue;
    let otherId: string | undefined;
    if (relation.fromId === entityId) otherId = relation.toId;
    else if (relation.toId === entityId) otherId = relation.fromId;
    if (!otherId) continue;
    const other = entities.get(otherId);
    if (other) out.push(other);
  }
  return out;
}

export function snapshotKnowledgeGraph(): KnowledgeGraphSnapshot {
  const byEntityKind: Record<string, number> = {};
  const byRelationKind: Record<string, number> = {};

  for (const entity of entities.values()) {
    byEntityKind[entity.kind] = (byEntityKind[entity.kind] ?? 0) + 1;
  }
  for (const relation of relations.values()) {
    byRelationKind[relation.kind] = (byRelationKind[relation.kind] ?? 0) + 1;
  }

  return {
    entityCount: entities.size,
    relationCount: relations.size,
    byEntityKind: Object.freeze(byEntityKind),
    byRelationKind: Object.freeze(byRelationKind),
    readOnly: true,
  };
}
