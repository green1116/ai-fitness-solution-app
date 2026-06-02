import type {
  CoverageRecord,
  CoverageSummary,
  RequirementCoverageResult,
} from "../types";

/** E1 兼容：CoverageStatus → CoverageRecord */
export function toLegacyCoverageRecords(
  results: RequirementCoverageResult[],
): CoverageRecord[] {
  return results.map((r) => ({
    requirementId: r.requirementId,
    level: r.legacyLevel,
    evidenceIds: r.analysis.evidenceIds,
    notes: r.explain.slice(0, 5),
  }));
}

export function toLegacyCoverageSummary(
  records: CoverageRecord[],
): CoverageSummary {
  const fully = records.filter((c) => c.level === "fully_evidenced").length;
  const partial = records.filter((c) => c.level === "partially_evidenced").length;
  const unsupported = records.filter((c) => c.level === "unsupported").length;
  const risky = records.filter((c) => c.level === "risky").length;
  const total = records.length;
  const ratio = total ? (fully + partial * 0.5) / total : 1;

  return {
    total,
    fully,
    partial,
    unsupported,
    risky,
    ratio: Math.round(ratio * 1000) / 1000,
  };
}
