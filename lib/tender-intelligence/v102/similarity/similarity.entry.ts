/**
 * E02-P5 — Similar Tender Intelligence entry
 */

export {
  assertSimilarityKernelPass,
  buildSimilarTenderProfile,
  buildSimilarityKernel,
  buildSimilarityLifecycle,
  buildTenderFeatureFingerprint,
  matchSimilarTenders,
} from "./similarity.builder";

export {
  assertValidSimilarTenderProfile,
  SIMILAR_TENDER_PROFILE_STATUSES,
  SIMILARITY_DIMENSIONS,
  SIMILARITY_LIFECYCLE_STAGES,
  validateKnowledgeContextInput,
  validateSimilarTenderMatch,
  validateSimilarTenderProfile,
  validateSimilarityKernelInput,
  validateTenderFeatureFingerprint,
} from "./similarity.schema";

export type { SchemaIssue, SchemaResult } from "./similarity.schema";

export {
  V102_SIMILAR_TENDER_FREEZE_VERSION,
  V102_SIMILAR_TENDER_VERSION,
} from "./similarity.types";

export type {
  SimilarTenderMatch,
  SimilarTenderProfile,
  SimilarTenderProfileStatus,
  SimilarityDimension,
  SimilarityKernelInput,
  SimilarityKernelResult,
  SimilarityLifecycle,
  SimilarityLifecycleStage,
  SimilarityLifecycleTransition,
  TenderFeatureFingerprint,
} from "./similarity.types";

import {
  assertSimilarityKernelPass,
  buildSimilarityKernel,
} from "./similarity.builder";
import type {
  SimilarityKernelInput,
  SimilarityKernelResult,
} from "./similarity.types";

export function runSimilarityKernel(
  input: SimilarityKernelInput,
): SimilarityKernelResult {
  return buildSimilarityKernel(input);
}

export function runSimilarityKernelOrThrow(
  input: SimilarityKernelInput,
): SimilarityKernelResult & {
  ready: true;
  profile: NonNullable<SimilarityKernelResult["profile"]>;
} {
  const result = buildSimilarityKernel(input);
  assertSimilarityKernelPass(result);
  return result;
}

export function formatSimilarityKernelSummary(
  result: SimilarityKernelResult,
): string {
  const lines = [
    "V102 Similar Tender Intelligence Engine",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  context: ${result.context.title}`,
    `  fingerprint: dims=${result.fingerprint.dimensions.length} keywords=${result.fingerprint.keywords.length}`,
    `  matches: ${result.matches.length}`,
    `  profile: ${
      result.profile
        ? `status=${result.profile.status} top=${result.profile.topScore} coverage=${result.profile.dimensionCoverage.length}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
