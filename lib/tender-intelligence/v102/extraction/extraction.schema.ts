/**
 * E02-P2 — Knowledge Entity Extraction schema (pure TS validation)
 */

import type { KnowledgeNodeKind } from "../knowledge/knowledge.types";
import { KNOWLEDGE_EDGE_KINDS, KNOWLEDGE_NODE_KINDS } from "../knowledge/knowledge.schema";
import type {
  EntityRelationCandidate,
  ExtractedEntity,
  ExtractionCandidateStatus,
  ExtractionKernelInput,
  ExtractionLifecycleStage,
  KnowledgeGraphCandidatePack,
} from "./extraction.types";

export const EXTRACTION_LIFECYCLE_STAGES: readonly ExtractionLifecycleStage[] = [
  "content",
  "entities",
  "candidates",
] as const;

export const EXTRACTION_CANDIDATE_STATUSES: readonly ExtractionCandidateStatus[] = [
  "pending",
  "extracted",
  "ready",
  "failed",
] as const;

export { KNOWLEDGE_NODE_KINDS, KNOWLEDGE_EDGE_KINDS };

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateExtractedEntity(entity: unknown): SchemaResult<ExtractedEntity> {
  const issues: SchemaIssue[] = [];
  if (!entity || typeof entity !== "object") {
    return { ok: false, issues: [issue("entity", "entity is required")] };
  }

  const e = entity as Partial<ExtractedEntity>;
  if (!isNonEmptyString(e.id)) issues.push(issue("entity.id", "id is required"));
  if (!isNonEmptyString(e.label)) issues.push(issue("entity.label", "label is required"));
  if (!isNonEmptyString(e.evidence)) {
    issues.push(issue("entity.evidence", "evidence is required"));
  }
  if (!isNonEmptyString(e.sourceHint)) {
    issues.push(issue("entity.sourceHint", "sourceHint is required"));
  }
  if (
    typeof e.kind !== "string" ||
    !(KNOWLEDGE_NODE_KINDS as readonly string[]).includes(e.kind)
  ) {
    issues.push(issue("entity.kind", `kind must be one of: ${KNOWLEDGE_NODE_KINDS.join(", ")}`));
  }
  if (!Array.isArray(e.aliases)) {
    issues.push(issue("entity.aliases", "aliases must be an array"));
  }
  if (typeof e.confidence !== "number" || e.confidence < 0 || e.confidence > 1) {
    issues.push(issue("entity.confidence", "confidence must be between 0 and 1"));
  }
  if (e.readOnly !== true) issues.push(issue("entity.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: entity as ExtractedEntity };
}

export function validateEntityRelationCandidate(
  relation: unknown,
  entityIds?: Set<string>,
): SchemaResult<EntityRelationCandidate> {
  const issues: SchemaIssue[] = [];
  if (!relation || typeof relation !== "object") {
    return { ok: false, issues: [issue("relation", "relation is required")] };
  }

  const r = relation as Partial<EntityRelationCandidate>;
  if (!isNonEmptyString(r.id)) issues.push(issue("relation.id", "id is required"));
  if (!isNonEmptyString(r.fromEntityId)) {
    issues.push(issue("relation.fromEntityId", "fromEntityId is required"));
  }
  if (!isNonEmptyString(r.toEntityId)) {
    issues.push(issue("relation.toEntityId", "toEntityId is required"));
  }
  if (!isNonEmptyString(r.label)) issues.push(issue("relation.label", "label is required"));
  if (
    typeof r.kind !== "string" ||
    !(KNOWLEDGE_EDGE_KINDS as readonly string[]).includes(r.kind)
  ) {
    issues.push(issue("relation.kind", `kind must be one of: ${KNOWLEDGE_EDGE_KINDS.join(", ")}`));
  }
  if (typeof r.confidence !== "number" || r.confidence < 0 || r.confidence > 1) {
    issues.push(issue("relation.confidence", "confidence must be between 0 and 1"));
  }
  if (r.readOnly !== true) issues.push(issue("relation.readOnly", "readOnly must be true"));

  if (entityIds) {
    if (isNonEmptyString(r.fromEntityId) && !entityIds.has(r.fromEntityId)) {
      issues.push(issue("relation.fromEntityId", "fromEntityId must reference an entity"));
    }
    if (isNonEmptyString(r.toEntityId) && !entityIds.has(r.toEntityId)) {
      issues.push(issue("relation.toEntityId", "toEntityId must reference an entity"));
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: relation as EntityRelationCandidate };
}

export function validateKnowledgeGraphCandidatePack(
  pack: unknown,
): SchemaResult<KnowledgeGraphCandidatePack> {
  const issues: SchemaIssue[] = [];
  if (!pack || typeof pack !== "object") {
    return { ok: false, issues: [issue("candidates", "candidates pack is required")] };
  }

  const p = pack as Partial<KnowledgeGraphCandidatePack>;
  if (!isNonEmptyString(p.id)) issues.push(issue("candidates.id", "id is required"));
  if (!isNonEmptyString(p.title)) issues.push(issue("candidates.title", "title is required"));
  if (
    typeof p.status !== "string" ||
    !(EXTRACTION_CANDIDATE_STATUSES as readonly string[]).includes(p.status)
  ) {
    issues.push(
      issue(
        "candidates.status",
        `status must be one of: ${EXTRACTION_CANDIDATE_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(p.entities) || p.entities.length < 1) {
    issues.push(issue("candidates.entities", "entities must be non-empty"));
  }
  if (!Array.isArray(p.relations)) {
    issues.push(issue("candidates.relations", "relations must be an array"));
  }
  if (!Array.isArray(p.nodeSeeds)) {
    issues.push(issue("candidates.nodeSeeds", "nodeSeeds must be an array"));
  }
  if (!Array.isArray(p.edgeSeeds)) {
    issues.push(issue("candidates.edgeSeeds", "edgeSeeds must be an array"));
  }
  if (
    typeof p.entityCount === "number" &&
    Array.isArray(p.entities) &&
    p.entityCount !== p.entities.length
  ) {
    issues.push(issue("candidates.entityCount", "entityCount must match entities.length"));
  }
  if (p.readOnly !== true) {
    issues.push(issue("candidates.readOnly", "readOnly must be true"));
  }

  if (Array.isArray(p.entities) && Array.isArray(p.relations)) {
    const entityIds = new Set(
      p.entities
        .filter((e): e is ExtractedEntity => Boolean(e && typeof e === "object"))
        .map((e) => e.id),
    );
    for (let i = 0; i < p.entities.length; i++) {
      const result = validateExtractedEntity(p.entities[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) => issue(`candidates.entities[${i}].${it.path}`, it.message)),
        );
      }
    }
    for (let i = 0; i < p.relations.length; i++) {
      const result = validateEntityRelationCandidate(p.relations[i], entityIds);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) =>
            issue(`candidates.relations[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: pack as KnowledgeGraphCandidatePack };
}

export function validateExtractionKernelInput(
  input: unknown,
): SchemaResult<ExtractionKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<ExtractionKernelInput>;
  if (!isNonEmptyString(i.rawText) || i.rawText.trim().length < 20) {
    issues.push(issue("input.rawText", "rawText must be at least 20 characters"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as ExtractionKernelInput };
}

export function assertValidCandidatePack(pack: KnowledgeGraphCandidatePack): void {
  const result = validateKnowledgeGraphCandidatePack(pack);
  if (!result.ok) {
    throw new Error(
      `Invalid KnowledgeGraphCandidatePack: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}

export type { KnowledgeNodeKind };
