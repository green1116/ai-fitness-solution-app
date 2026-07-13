/**
 * E02-P3 — Knowledge Relationship schema (pure TS validation)
 */

import { KNOWLEDGE_EDGE_KINDS, KNOWLEDGE_NODE_KINDS } from "../knowledge/knowledge.schema";
import type {
  KnowledgeRelationship,
  RelationshipKernelInput,
  RelationshipLifecycleStage,
  RelationshipNetwork,
  RelationshipNetworkStatus,
  RelationshipStrength,
} from "./relationship.types";

export const RELATIONSHIP_LIFECYCLE_STAGES: readonly RelationshipLifecycleStage[] = [
  "candidates",
  "relationships",
  "network",
] as const;

export const RELATIONSHIP_NETWORK_STATUSES: readonly RelationshipNetworkStatus[] = [
  "pending",
  "linked",
  "ready",
  "failed",
] as const;

export const RELATIONSHIP_STRENGTHS: readonly RelationshipStrength[] = [
  "weak",
  "moderate",
  "strong",
] as const;

export { KNOWLEDGE_EDGE_KINDS, KNOWLEDGE_NODE_KINDS };

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

export function validateKnowledgeRelationship(
  relationship: unknown,
): SchemaResult<KnowledgeRelationship> {
  const issues: SchemaIssue[] = [];
  if (!relationship || typeof relationship !== "object") {
    return { ok: false, issues: [issue("relationship", "relationship is required")] };
  }

  const r = relationship as Partial<KnowledgeRelationship>;
  if (!isNonEmptyString(r.id)) issues.push(issue("relationship.id", "id is required"));
  if (!isNonEmptyString(r.fromEntityId)) {
    issues.push(issue("relationship.fromEntityId", "fromEntityId is required"));
  }
  if (!isNonEmptyString(r.toEntityId)) {
    issues.push(issue("relationship.toEntityId", "toEntityId is required"));
  }
  if (!isNonEmptyString(r.fromLabel)) {
    issues.push(issue("relationship.fromLabel", "fromLabel is required"));
  }
  if (!isNonEmptyString(r.toLabel)) {
    issues.push(issue("relationship.toLabel", "toLabel is required"));
  }
  if (!isNonEmptyString(r.label)) {
    issues.push(issue("relationship.label", "label is required"));
  }
  if (!isNonEmptyString(r.evidence)) {
    issues.push(issue("relationship.evidence", "evidence is required"));
  }
  if (
    typeof r.kind !== "string" ||
    !(KNOWLEDGE_EDGE_KINDS as readonly string[]).includes(r.kind)
  ) {
    issues.push(
      issue("relationship.kind", `kind must be one of: ${KNOWLEDGE_EDGE_KINDS.join(", ")}`),
    );
  }
  if (
    typeof r.fromKind !== "string" ||
    !(KNOWLEDGE_NODE_KINDS as readonly string[]).includes(r.fromKind)
  ) {
    issues.push(
      issue(
        "relationship.fromKind",
        `fromKind must be one of: ${KNOWLEDGE_NODE_KINDS.join(", ")}`,
      ),
    );
  }
  if (
    typeof r.toKind !== "string" ||
    !(KNOWLEDGE_NODE_KINDS as readonly string[]).includes(r.toKind)
  ) {
    issues.push(
      issue("relationship.toKind", `toKind must be one of: ${KNOWLEDGE_NODE_KINDS.join(", ")}`),
    );
  }
  if (
    typeof r.strength !== "string" ||
    !(RELATIONSHIP_STRENGTHS as readonly string[]).includes(r.strength)
  ) {
    issues.push(
      issue(
        "relationship.strength",
        `strength must be one of: ${RELATIONSHIP_STRENGTHS.join(", ")}`,
      ),
    );
  }
  if (typeof r.weight !== "number" || r.weight < 0) {
    issues.push(issue("relationship.weight", "weight must be a non-negative number"));
  }
  if (typeof r.confidence !== "number" || r.confidence < 0 || r.confidence > 1) {
    issues.push(issue("relationship.confidence", "confidence must be between 0 and 1"));
  }
  if (typeof r.derived !== "boolean") {
    issues.push(issue("relationship.derived", "derived must be boolean"));
  }
  if (r.readOnly !== true) {
    issues.push(issue("relationship.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: relationship as KnowledgeRelationship };
}

export function validateRelationshipNetwork(
  network: unknown,
): SchemaResult<RelationshipNetwork> {
  const issues: SchemaIssue[] = [];
  if (!network || typeof network !== "object") {
    return { ok: false, issues: [issue("network", "network is required")] };
  }

  const n = network as Partial<RelationshipNetwork>;
  if (!isNonEmptyString(n.id)) issues.push(issue("network.id", "id is required"));
  if (!isNonEmptyString(n.title)) issues.push(issue("network.title", "title is required"));
  if (
    typeof n.status !== "string" ||
    !(RELATIONSHIP_NETWORK_STATUSES as readonly string[]).includes(n.status)
  ) {
    issues.push(
      issue(
        "network.status",
        `status must be one of: ${RELATIONSHIP_NETWORK_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(n.relationships) || n.relationships.length < 1) {
    issues.push(issue("network.relationships", "relationships must be non-empty"));
  }
  if (!Array.isArray(n.edgeSeeds)) {
    issues.push(issue("network.edgeSeeds", "edgeSeeds must be an array"));
  }
  if (
    typeof n.relationshipCount === "number" &&
    Array.isArray(n.relationships) &&
    n.relationshipCount !== n.relationships.length
  ) {
    issues.push(
      issue("network.relationshipCount", "relationshipCount must match relationships.length"),
    );
  }
  if (n.readOnly !== true) {
    issues.push(issue("network.readOnly", "readOnly must be true"));
  }

  if (Array.isArray(n.relationships)) {
    for (let i = 0; i < n.relationships.length; i++) {
      const result = validateKnowledgeRelationship(n.relationships[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) =>
            issue(`network.relationships[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: network as RelationshipNetwork };
}

export function validateRelationshipKernelInput(
  input: unknown,
): SchemaResult<RelationshipKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<RelationshipKernelInput>;
  const hasCandidates =
    i.candidates &&
    typeof i.candidates === "object" &&
    Array.isArray(i.candidates.entities) &&
    i.candidates.entities.length > 0;
  const hasEntities = Array.isArray(i.entities) && i.entities.length > 0;
  const hasRelations =
    Array.isArray(i.relationCandidates) && i.relationCandidates.length > 0;

  if (!hasCandidates && !(hasEntities && hasRelations)) {
    issues.push(
      issue(
        "input",
        "candidates pack, or entities + relationCandidates, is required",
      ),
    );
  }

  if (
    i.minConfidence !== undefined &&
    (typeof i.minConfidence !== "number" ||
      i.minConfidence < 0 ||
      i.minConfidence > 1)
  ) {
    issues.push(issue("input.minConfidence", "minConfidence must be between 0 and 1"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as RelationshipKernelInput };
}

export function assertValidRelationshipNetwork(network: RelationshipNetwork): void {
  const result = validateRelationshipNetwork(network);
  if (!result.ok) {
    throw new Error(
      `Invalid RelationshipNetwork: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
