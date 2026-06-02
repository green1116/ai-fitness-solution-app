import type {
  CoverageAnalysis,
  CoveragePolicy,
  CoverageStatus,
  RequirementCoverageResult,
} from "../types";
import { DEFAULT_COVERAGE_POLICY } from "../types";
import type { RequirementItem } from "../types";
import { coverageStatusToLegacyLevel } from "./statusMap";

export function resolveCoverageStatus(
  analysis: CoverageAnalysis,
  policy: typeof DEFAULT_COVERAGE_POLICY,
): CoverageStatus {
  if (analysis.conflictSignals.length > 0) {
    return "conflict";
  }

  if (analysis.matchCount === 0) {
    if (analysis.mandatory) return "missing";
    return analysis.keywordCoverageRatio === 0 && analysis.bestScore === 0
      ? "missing"
      : "unknown";
  }

  const { coveredMinScore, partialMinScore, coveredKeywordRatio } = policy;

  if (
    analysis.bestScore >= coveredMinScore &&
    analysis.keywordCoverageRatio >= coveredKeywordRatio
  ) {
    return "covered";
  }

  if (analysis.bestScore >= partialMinScore || analysis.keywordCoverageRatio >= 0.3) {
    return "partial";
  }

  return analysis.mandatory ? "missing" : "partial";
}

export function buildRequirementCoverageResult(
  requirement: RequirementItem,
  analysis: CoverageAnalysis,
  policy?: CoveragePolicy,
): RequirementCoverageResult {
  const resolvedPolicy = { ...DEFAULT_COVERAGE_POLICY, ...policy };
  const status = resolveCoverageStatus(analysis, resolvedPolicy);
  const legacyLevel = coverageStatusToLegacyLevel(status, analysis.mandatory);

  const explain = [
    `覆盖状态：${status}`,
    `legacy=${legacyLevel}`,
    ...analysis.findings,
  ];
  if (analysis.conflictSignals.length) {
    explain.push(...analysis.conflictSignals.map((s) => `冲突信号：${s}`));
  }

  return {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    status,
    analysis,
    legacyLevel,
    explain,
  };
}
