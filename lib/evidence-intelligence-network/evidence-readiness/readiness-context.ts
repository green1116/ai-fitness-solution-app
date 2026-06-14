import type {
  EvidenceReadinessContext,
  EvidenceReadinessResult,
  RegistryValidation,
} from "../shared/types";
import { READINESS_MIN_SCORE } from "../shared/types";
import { buildEvidenceRegistryRecords } from "../evidence-registry";
import {
  buildEvidenceReadinessScore,
  deriveReadinessBlockers,
} from "./readiness-scoring";

export function buildEvidenceReadinessResult(brandId: string): EvidenceReadinessResult {
  const score = buildEvidenceReadinessScore(brandId);
  const { criticalBlockers, warningItems } = deriveReadinessBlockers(brandId, score);

  return {
    resultId: `evidence-readiness-result-${brandId}`,
    brandId,
    score,
    readinessReady: criticalBlockers.length === 0 && score.totalReadinessScore >= READINESS_MIN_SCORE,
    criticalBlockers,
    warningItems,
    mode: "evidence-intelligence-network",
  };
}

export function buildEvidenceReadinessResults(): EvidenceReadinessResult[] {
  const brandIds = [...new Set(buildEvidenceRegistryRecords().map((record) => record.brandId))];
  return brandIds.map(buildEvidenceReadinessResult);
}

export function buildEvidenceReadinessContext(): EvidenceReadinessContext {
  const results = buildEvidenceReadinessResults();
  const readyCount = results.filter((result) => result.readinessReady).length;
  const averageReadinessScore =
    results.length === 0
      ? 0
      : Math.round(
          results.reduce((sum, result) => sum + result.score.totalReadinessScore, 0) /
            results.length,
        );

  return {
    contextId: "evidence-readiness-context-v39-p4",
    results,
    resultCount: results.length,
    readyCount,
    averageReadinessScore,
    contextReady: readyCount >= 1 && averageReadinessScore >= READINESS_MIN_SCORE,
    mode: "evidence-intelligence-network",
  };
}

export function findEvidenceReadinessByBrand(brandId: string): EvidenceReadinessResult | undefined {
  return buildEvidenceReadinessResults().find((result) => result.brandId === brandId);
}

export function validateEvidenceReadinessRegistry(): RegistryValidation {
  const context = buildEvidenceReadinessContext();
  const canonical = findEvidenceReadinessByBrand("brand-life-fitness");

  const valid =
    context.contextReady &&
    context.resultCount >= 8 &&
    context.readyCount >= 1 &&
    Boolean(canonical) &&
    canonical!.readinessReady &&
    canonical!.criticalBlockers.length === 0 &&
    canonical!.score.totalReadinessScore >= READINESS_MIN_SCORE;

  return {
    valid,
    count: context.readyCount,
    summary: `evidence-readiness results=${context.resultCount} ready=${context.readyCount} avgScore=${context.averageReadinessScore} canonicalReady=${canonical?.readinessReady ?? false} valid=${valid}`,
  };
}
