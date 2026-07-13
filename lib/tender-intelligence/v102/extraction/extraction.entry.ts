/**
 * E02-P2 — Knowledge Entity Extraction entry
 */

export {
  assertExtractionKernelPass,
  buildEntityRelationCandidate,
  buildExtractionKernel,
  buildExtractionLifecycle,
  buildExtractedEntity,
  buildKnowledgeGraphCandidatePack,
  buildRelationCandidates,
  extractEntitiesFromContent,
  toKnowledgeSeeds,
} from "./extraction.builder";

export {
  assertValidCandidatePack,
  EXTRACTION_CANDIDATE_STATUSES,
  EXTRACTION_LIFECYCLE_STAGES,
  KNOWLEDGE_EDGE_KINDS,
  KNOWLEDGE_NODE_KINDS,
  validateEntityRelationCandidate,
  validateExtractedEntity,
  validateExtractionKernelInput,
  validateKnowledgeGraphCandidatePack,
} from "./extraction.schema";

export type { SchemaIssue, SchemaResult } from "./extraction.schema";

export {
  V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
  V102_KNOWLEDGE_EXTRACTION_VERSION,
} from "./extraction.types";

export type {
  EntityRelationCandidate,
  ExtractedEntity,
  ExtractionCandidateStatus,
  ExtractionKernelInput,
  ExtractionKernelResult,
  ExtractionLifecycle,
  ExtractionLifecycleStage,
  ExtractionLifecycleTransition,
  ExtractionSpan,
  KnowledgeGraphCandidatePack,
} from "./extraction.types";

import {
  assertExtractionKernelPass,
  buildExtractionKernel,
} from "./extraction.builder";
import type {
  ExtractionKernelInput,
  ExtractionKernelResult,
} from "./extraction.types";

export function runExtractionKernel(
  input: ExtractionKernelInput,
): ExtractionKernelResult {
  return buildExtractionKernel(input);
}

export function runExtractionKernelOrThrow(
  input: ExtractionKernelInput,
): ExtractionKernelResult & {
  ready: true;
  candidates: NonNullable<ExtractionKernelResult["candidates"]>;
} {
  const result = buildExtractionKernel(input);
  assertExtractionKernelPass(result);
  return result;
}

export function formatExtractionKernelSummary(
  result: ExtractionKernelResult,
): string {
  const lines = [
    "V102 Knowledge Entity Extraction Engine",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  contentLength: ${result.contentLength}`,
    `  entities: ${result.entities.length}`,
    `  relations: ${result.relations.length}`,
    `  candidates: ${
      result.candidates
        ? `status=${result.candidates.status} seeds=${result.candidates.nodeSeeds.length}/${result.candidates.edgeSeeds.length}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
