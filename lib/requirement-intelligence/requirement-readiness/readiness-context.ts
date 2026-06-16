import { buildRequirementGraph } from "../requirement-graph/requirement-graph-context";
import { buildRequirementRegistryRecords } from "../requirement-registry";
import type {
  RequirementReadinessContext,
  RequirementReadinessResult,
  RequirementValidation,
} from "../shared/types";
import {
  CANONICAL_REQUIREMENT_MATCHER_BRAND_ID,
  REQUIREMENT_READINESS_MIN_BLOCKED_COUNT,
  REQUIREMENT_READINESS_MIN_PARTIAL_COUNT,
  REQUIREMENT_READINESS_MIN_READY_COUNT,
  REQUIREMENT_READINESS_MIN_SCORE,
} from "../shared/types";
import {
  buildRequirementReadinessResult,
  buildRequirementReadinessResultById,
} from "./readiness-scoring";

let cachedReadinessResults: RequirementReadinessResult[] | undefined;

export function buildRequirementReadinessResults(): RequirementReadinessResult[] {
  if (!cachedReadinessResults) {
    const graph = buildRequirementGraph();
    cachedReadinessResults = buildRequirementRegistryRecords().map((record) =>
      buildRequirementReadinessResult(record, graph),
    );
  }
  return cachedReadinessResults;
}

export function buildRequirementReadinessContext(): RequirementReadinessContext {
  const results = buildRequirementReadinessResults();
  const readyCount = results.filter((result) => result.readinessStatus === "ready").length;
  const partialCount = results.filter((result) => result.readinessStatus === "partial").length;
  const blockedCount = results.filter((result) => result.readinessStatus === "blocked").length;
  const notReadyCount = results.filter((result) => result.readinessStatus === "not-ready").length;
  const averageReadinessScore =
    results.length === 0
      ? 0
      : Math.round(
          results.reduce((sum, result) => sum + result.score.totalRequirementReadiness, 0) /
            results.length,
        );

  const contextReady =
    results.length >= 50 &&
    readyCount > REQUIREMENT_READINESS_MIN_READY_COUNT &&
    partialCount > REQUIREMENT_READINESS_MIN_PARTIAL_COUNT &&
    blockedCount > REQUIREMENT_READINESS_MIN_BLOCKED_COUNT;

  return {
    contextId: "requirement-readiness-context-v40-p4",
    results,
    resultCount: results.length,
    readyCount,
    partialCount,
    blockedCount,
    notReadyCount,
    averageReadinessScore,
    contextReady,
    mode: "requirement-intelligence",
  };
}

export function findRequirementReadinessById(
  requirementId: string,
): RequirementReadinessResult | undefined {
  return buildRequirementReadinessResults().find(
    (result) => result.requirementId === requirementId,
  );
}

export function findReadyRequirements(limit?: number): RequirementReadinessResult[] {
  const results = buildRequirementReadinessResults().filter((result) => result.readinessReady);
  return limit === undefined ? results : results.slice(0, limit);
}

export function findBlockedReadinessRequirements(limit?: number): RequirementReadinessResult[] {
  const results = buildRequirementReadinessResults().filter(
    (result) => result.readinessStatus === "blocked",
  );
  return limit === undefined ? results : results.slice(0, limit);
}

function resolveCanonicalReadinessResult(
  results: RequirementReadinessResult[],
): RequirementReadinessResult | undefined {
  return (
    results.find(
      (result) =>
        result.readinessReady && result.brandId === CANONICAL_REQUIREMENT_MATCHER_BRAND_ID,
    ) ?? results.find((result) => result.readinessReady)
  );
}

export function validateRequirementReadinessFromContext(
  context: RequirementReadinessContext,
  canonical?: RequirementReadinessResult,
): RequirementValidation {
  const canonicalResult = canonical ?? resolveCanonicalReadinessResult(context.results);

  const valid =
    context.contextReady &&
    context.readyCount > REQUIREMENT_READINESS_MIN_READY_COUNT &&
    context.partialCount > REQUIREMENT_READINESS_MIN_PARTIAL_COUNT &&
    context.blockedCount > REQUIREMENT_READINESS_MIN_BLOCKED_COUNT &&
    Boolean(canonicalResult) &&
    canonicalResult!.readinessReady &&
    canonicalResult!.criticalBlockers.length === 0 &&
    canonicalResult!.score.totalRequirementReadiness >= REQUIREMENT_READINESS_MIN_SCORE;

  return {
    valid,
    count: context.resultCount,
    summary: `requirement-readiness results=${context.resultCount} ready=${context.readyCount} partial=${context.partialCount} blocked=${context.blockedCount} notReady=${context.notReadyCount} avgScore=${context.averageReadinessScore} canonicalReady=${canonicalResult?.readinessReady ?? false} valid=${valid}`,
  };
}

export function validateRequirementReadiness(): RequirementValidation {
  const context = buildRequirementReadinessContext();
  return validateRequirementReadinessFromContext(context);
}

export { buildRequirementReadinessResultById, resolveCanonicalReadinessResult };
