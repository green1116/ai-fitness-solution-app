/**
 * E04-P6 — Business Knowledge Validator
 */

import {
  listKnowledgeEntities,
  listKnowledgeRelations,
} from "./knowledge.graph";
import type {
  KnowledgeValidationIssue,
  KnowledgeValidationResult,
} from "./knowledge.types";

export function validateKnowledgeGraph(): KnowledgeValidationResult {
  const entities = listKnowledgeEntities();
  const relations = listKnowledgeRelations();
  const entityIds = new Set(entities.map((e) => e.id));
  const issues: KnowledgeValidationIssue[] = [];

  const seenEntityIds = new Set<string>();
  for (const entity of entities) {
    if (seenEntityIds.has(entity.id)) {
      issues.push({
        code: "duplicate_entity",
        message: `duplicate entity id ${entity.id}`,
        entityId: entity.id,
        readOnly: true,
      });
    }
    seenEntityIds.add(entity.id);

    if (!entity.name.trim()) {
      issues.push({
        code: "empty_name",
        message: `entity ${entity.id} has empty name`,
        entityId: entity.id,
        readOnly: true,
      });
    }
    if (entity.readOnly !== true) {
      issues.push({
        code: "not_readonly",
        message: `entity ${entity.id} is not readOnly`,
        entityId: entity.id,
        readOnly: true,
      });
    }
  }

  const seenRelationIds = new Set<string>();
  for (const relation of relations) {
    if (seenRelationIds.has(relation.id)) {
      issues.push({
        code: "duplicate_relation",
        message: `duplicate relation id ${relation.id}`,
        relationId: relation.id,
        readOnly: true,
      });
    }
    seenRelationIds.add(relation.id);

    if (!entityIds.has(relation.fromId)) {
      issues.push({
        code: "missing_from",
        message: `relation ${relation.id} missing from ${relation.fromId}`,
        relationId: relation.id,
        readOnly: true,
      });
    }
    if (!entityIds.has(relation.toId)) {
      issues.push({
        code: "missing_to",
        message: `relation ${relation.id} missing to ${relation.toId}`,
        relationId: relation.id,
        readOnly: true,
      });
    }
    if (relation.fromId === relation.toId) {
      issues.push({
        code: "self_loop",
        message: `relation ${relation.id} is a self-loop`,
        relationId: relation.id,
        readOnly: true,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues: Object.freeze([...issues]) as KnowledgeValidationIssue[],
    readOnly: true,
  };
}

export function assertKnowledgeGraphValid(): void {
  const result = validateKnowledgeGraph();
  if (!result.valid) {
    throw new Error(
      `knowledge graph invalid: ${result.issues.map((i) => i.code).join(",")}`,
    );
  }
}
