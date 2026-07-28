/**
 * Product M11 — Knowledge entity in-memory registry
 */

import {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_ENTITY_STATUSES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
} from "./knowledge.constants";
import { validateKnowledgeEntityInput } from "./knowledge.metadata";
import type {
  KnowledgeEntity,
  KnowledgeEntityKind,
  KnowledgeEntityStatus,
  RegisterKnowledgeEntityInput,
  UpdateKnowledgeEntityStatusInput,
} from "./knowledge.types";

const entities = new Map<string, KnowledgeEntity>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntity(entity: KnowledgeEntity): KnowledgeEntity {
  return {
    ...entity,
    tags: [...entity.tags],
    metadata: { ...entity.metadata },
  };
}

export function registerKnowledgeEntity(
  input: RegisterKnowledgeEntityInput,
): KnowledgeEntity {
  const validation = validateKnowledgeEntityInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid knowledge entity: ${first?.field} ${first?.message}`,
    );
  }

  const entityKey = input.entityKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const runtimeBaselineRef = (
    input.runtimeBaselineRef ?? PRODUCT_KNOWLEDGE_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();
  const access = input.access ?? KNOWLEDGE_ACCESS_LEVELS[1];
  const tags = (input.tags ?? []).map((t) => t.trim().toLowerCase());

  if (keys.has(entityKey)) {
    throw new Error(`entityKey already exists: ${entityKey}`);
  }

  const id = input.id?.trim() || createId("knwent");
  if (entities.has(id)) throw new Error(`knowledge entity already exists: ${id}`);

  const now = nowIso();
  const entity: KnowledgeEntity = {
    id,
    entityKey,
    kind: input.kind,
    status: KNOWLEDGE_ENTITY_STATUSES[0],
    access,
    scope: input.scope,
    title,
    summary,
    tags,
    runtimeBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  entities.set(id, entity);
  keys.set(entityKey, id);
  return cloneEntity(entity);
}

export function updateKnowledgeEntityStatus(
  input: UpdateKnowledgeEntityStatusInput,
): KnowledgeEntity {
  const entityId = input.entityId.trim();
  if (!entityId) throw new Error("entity.entityId is required");
  if (!(KNOWLEDGE_ENTITY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid entity status: ${input.status}`);
  }

  const existing = entities.get(entityId);
  if (!existing) throw new Error(`knowledge entity not found: ${entityId}`);

  const updated: KnowledgeEntity = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    tags: [...existing.tags],
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  entities.set(entityId, updated);
  return cloneEntity(updated);
}

export function getKnowledgeEntity(id: string): KnowledgeEntity | undefined {
  const entity = entities.get(id.trim());
  return entity ? cloneEntity(entity) : undefined;
}

export function getKnowledgeEntityByKey(
  entityKey: string,
): KnowledgeEntity | undefined {
  const id = keys.get(entityKey.trim().toUpperCase());
  return id ? getKnowledgeEntity(id) : undefined;
}

export function listKnowledgeEntities(filter?: {
  kind?: KnowledgeEntityKind;
  status?: KnowledgeEntityStatus;
  tag?: string;
}): KnowledgeEntity[] {
  let result = [...entities.values()];
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  if (filter?.tag) {
    const tag = filter.tag.trim().toLowerCase();
    result = result.filter((e) => e.tags.includes(tag));
  }
  return result
    .slice()
    .sort((a, b) => a.entityKey.localeCompare(b.entityKey))
    .map(cloneEntity);
}

export function clearKnowledgeEntities(): void {
  entities.clear();
  keys.clear();
}
