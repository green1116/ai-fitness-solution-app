import type { CoverageAnalysis, RequirementLinkingResult } from "../types";
import type { RequirementItem } from "../types";

function detectConflicts(result: RequirementLinkingResult): string[] {
  const signals: string[] = [];
  const kinds = new Set(
    result.matches.map((m) => m.classificationKind).filter(Boolean),
  );

  if (kinds.size > 1) {
    signals.push(`证据类型不一致：${[...kinds].join(" vs ")}`);
  }

  if (result.matches.length >= 2) {
    const scores = result.matches.map((m) => m.score);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    if (max - min > 0.3 && min >= 0.35) {
      signals.push(`匹配分差异过大：${min} ~ ${max}`);
    }
  }

  const lowConf = result.matches.filter((m) => m.confidence < 0.45);
  if (lowConf.length && result.matches.length > 1) {
    signals.push(`${lowConf.length} 条匹配置信度偏低`);
  }

  return signals;
}

/**
 * Coverage Analysis — 基于 E3 证据匹配结果
 */
export function analyzeRequirementCoverage(
  requirement: RequirementItem,
  linkingResult: RequirementLinkingResult,
): CoverageAnalysis {
  const matches = linkingResult.matches;
  const keywords = linkingResult.mapping.keywords;
  const hitSet = new Set(matches.flatMap((m) => m.keywordHits));
  const keywordCoverageRatio =
    keywords.length > 0
      ? Math.round((hitSet.size / keywords.length) * 100) / 100
      : 0;

  const avgConfidence = matches.length
    ? Math.round(
        (matches.reduce((s, m) => s + m.confidence, 0) / matches.length) * 100,
      ) / 100
    : 0;

  const conflictSignals = detectConflicts(linkingResult);
  const findings: string[] = [];

  if (!matches.length) {
    findings.push(
      requirement.mandatory
        ? "强制性要求：未发现满足条件的附件证据"
        : "未发现附件证据匹配",
    );
  } else {
    findings.push(
      `共 ${matches.length} 份证据，最高匹配分 ${linkingResult.bestScore}`,
    );
    if (keywordCoverageRatio > 0) {
      findings.push(`关键词覆盖 ${Math.round(keywordCoverageRatio * 100)}%`);
    }
    const withLoc = matches.filter((m) => m.locations.length > 0).length;
    if (withLoc) findings.push(`${withLoc} 份证据已 OCR 块级定位`);
  }

  return {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    mandatory: !!requirement.mandatory,
    matchCount: matches.length,
    bestScore: linkingResult.bestScore,
    avgConfidence,
    evidenceIds: matches.map((m) => m.evidenceId),
    keywordCoverageRatio,
    hasOcrLocation: matches.some((m) => m.locations.length > 0),
    conflictSignals,
    findings,
  };
}

export function analyzeAllCoverage(
  requirements: RequirementItem[],
  linkingResults: RequirementLinkingResult[],
): CoverageAnalysis[] {
  const byId = new Map(linkingResults.map((r) => [r.requirementId, r]));
  return requirements.map((req) => {
    const linking = byId.get(req.id) || {
      requirementId: req.id,
      requirementTitle: req.title,
      mapping: { requirementId: req.id, keywords: req.keywords, expandedTerms: req.keywords, sources: [] },
      matches: [],
      bestScore: 0,
      coverageLevel: "unsupported" as const,
      coverageNotes: [],
    };
    return analyzeRequirementCoverage(req, linking);
  });
}
