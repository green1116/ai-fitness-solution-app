import type { EvidenceAdapterResult } from "@/lib/tender/evidence/bridge/buildEvidenceFromPipeline";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { RuntimeScoringImpact } from "../types";

export type ComputeScoringImpactInput = {
  evidence: EvidenceAdapterResult;
  graph?: TenderSemanticGraph;
  scoreRatio?: number | null;
};

/**
 * 估算证据缺口对评分的潜在影响（确定性启发式，无 LLM）
 */
export function computeRuntimeScoringImpact(
  input: ComputeScoringImpactInput,
): RuntimeScoringImpact {
  const { evidence, graph, scoreRatio = null } = input;
  const total = evidence.summary.total || evidence.coverage.length || 1;
  const fully = evidence.summary.fully ?? 0;
  const evidenceCoverageRatio = total > 0 ? fully / total : 0;

  const gaps = evidence.coverage.filter(
    (c) => c.status === "unsupported" || c.status === "risky",
  );
  const gapCount = gaps.filter((c) => c.status === "unsupported").length;
  const riskyCount = gaps.filter((c) => c.status === "risky").length;

  const gapReqIds = new Set(gaps.map((g) => g.requirementId));
  const scoringItems = graph?.scoringItems ?? [];

  const affectedScoringItemIds = scoringItems
    .filter((item) => {
      const linkedReqs = graph?.requirements.filter((r) =>
        r.relatedScoringItems?.includes(item.id),
      );
      return linkedReqs?.some((r) => gapReqIds.has(r.id));
    })
    .map((i) => i.id);

  const estimatedRecoverablePoints = Math.min(
    30,
    affectedScoringItemIds.length * 3 + gapCount * 1.5 + riskyCount * 0.5,
  );

  const narrative =
    scoreRatio != null
      ? `当前得分率约 ${Math.round(scoreRatio * 100)}%，证据覆盖率约 ${Math.round(evidenceCoverageRatio * 100)}%。补强 ${gapCount} 项无证据要求可能影响约 ${Math.round(estimatedRecoverablePoints)} 分。`
      : `证据覆盖率约 ${Math.round(evidenceCoverageRatio * 100)}%，${gapCount} 项无证据、${riskyCount} 项低置信度，关联 ${affectedScoringItemIds.length} 个评分项。`;

  return {
    currentScoreRatio: scoreRatio,
    evidenceCoverageRatio,
    gapCount,
    riskyCount,
    affectedScoringItemIds,
    estimatedRecoverablePoints: Math.round(estimatedRecoverablePoints * 10) / 10,
    narrative,
  };
}
