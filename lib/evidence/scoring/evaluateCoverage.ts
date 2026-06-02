import type {
  CoverageLevel,
  CoverageRecord,
  CoverageSummary,
  EvidenceRegistryState,
  RequirementAnchor,
} from "../types";
import { getEvidenceByRequirement } from "../registry";

function levelFrom(
  req: RequirementAnchor,
  evidenceCount: number,
  bestScore: number,
): CoverageLevel {
  if (evidenceCount === 0) {
    return req.mandatory ? "risky" : "unsupported";
  }
  if (bestScore >= 0.65) return "fully_evidenced";
  if (bestScore >= 0.4) return "partially_evidenced";
  return req.mandatory ? "risky" : "partially_evidenced";
}

/**
 * Coverage Runtime — 需求覆盖评估（确定性）
 */
export function evaluateCoverage(
  registry: EvidenceRegistryState,
  requirements: RequirementAnchor[],
): { coverage: CoverageRecord[]; summary: CoverageSummary } {
  const coverage: CoverageRecord[] = [];

  for (const req of requirements) {
    const linked = getEvidenceByRequirement(registry, req.id);
    const scores = registry.links
      .filter((l) => l.requirementId === req.id)
      .map((l) => l.score);
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const level = levelFrom(req, linked.length, bestScore);

    const notes: string[] = [];
    if (linked.length === 0) {
      notes.push(req.mandatory ? "强制性要求暂无附件证据" : "暂无匹配附件");
    } else {
      notes.push(`已关联 ${linked.length} 份证据，最高匹配分 ${bestScore}`);
    }

    coverage.push({
      requirementId: req.id,
      level,
      evidenceIds: linked.map((r) => r.id),
      notes,
    });
  }

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
