import type {
  CoverageRecord,
  CoverageSummary,
  RequirementLinkingResult,
} from "../types";

/**
 * 从 E3 Linking 结果生成 Coverage 记录
 */
export function coverageFromLinkingResults(
  results: RequirementLinkingResult[],
): { coverage: CoverageRecord[]; summary: CoverageSummary } {
  const coverage: CoverageRecord[] = results.map((r) => ({
    requirementId: r.requirementId,
    level: r.coverageLevel,
    evidenceIds: r.matches.map((m) => m.evidenceId),
    notes: [...r.coverageNotes, ...r.matches.flatMap((m) => m.explain).slice(0, 2)],
  }));

  const fully = coverage.filter((c) => c.level === "fully_evidenced").length;
  const partial = coverage.filter((c) => c.level === "partially_evidenced").length;
  const unsupported = coverage.filter((c) => c.level === "unsupported").length;
  const risky = coverage.filter((c) => c.level === "risky").length;
  const total = coverage.length;
  const ratio = total ? (fully + partial * 0.5) / total : 1;

  return {
    coverage,
    summary: {
      total,
      fully,
      partial,
      unsupported,
      risky,
      ratio: Math.round(ratio * 1000) / 1000,
    },
  };
}
