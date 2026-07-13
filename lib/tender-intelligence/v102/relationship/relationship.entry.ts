/**
 * E02-P3 — Knowledge Relationship entry
 */

export {
  assertRelationshipKernelPass,
  buildKnowledgeRelationship,
  buildRelationshipKernel,
  buildRelationshipLifecycle,
  buildRelationshipNetwork,
  relationshipsToEdgeSeeds,
  scoreRelationshipStrength,
  transformCandidatesToRelationships,
} from "./relationship.builder";

export {
  assertValidRelationshipNetwork,
  KNOWLEDGE_EDGE_KINDS,
  KNOWLEDGE_NODE_KINDS,
  RELATIONSHIP_LIFECYCLE_STAGES,
  RELATIONSHIP_NETWORK_STATUSES,
  RELATIONSHIP_STRENGTHS,
  validateKnowledgeRelationship,
  validateRelationshipKernelInput,
  validateRelationshipNetwork,
} from "./relationship.schema";

export type { SchemaIssue, SchemaResult } from "./relationship.schema";

export {
  V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
  V102_KNOWLEDGE_RELATIONSHIP_VERSION,
} from "./relationship.types";

export type {
  KnowledgeRelationship,
  RelationshipKernelInput,
  RelationshipKernelResult,
  RelationshipLifecycle,
  RelationshipLifecycleStage,
  RelationshipLifecycleTransition,
  RelationshipNetwork,
  RelationshipNetworkStatus,
  RelationshipStrength,
} from "./relationship.types";

import {
  assertRelationshipKernelPass,
  buildRelationshipKernel,
} from "./relationship.builder";
import type {
  RelationshipKernelInput,
  RelationshipKernelResult,
} from "./relationship.types";

export function runRelationshipKernel(
  input: RelationshipKernelInput,
): RelationshipKernelResult {
  return buildRelationshipKernel(input);
}

export function runRelationshipKernelOrThrow(
  input: RelationshipKernelInput,
): RelationshipKernelResult & {
  ready: true;
  network: NonNullable<RelationshipKernelResult["network"]>;
} {
  const result = buildRelationshipKernel(input);
  assertRelationshipKernelPass(result);
  return result;
}

export function formatRelationshipKernelSummary(
  result: RelationshipKernelResult,
): string {
  const lines = [
    "V102 Knowledge Relationship Engine",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  relationships: ${result.relationships.length}`,
    `  derived: ${result.relationships.filter((r) => r.derived).length}`,
    `  network: ${
      result.network
        ? `status=${result.network.status} strong=${result.network.strongCount} kinds=${result.network.kindCoverage.length}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
