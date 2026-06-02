import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import type { NormalizedEvidencePayload } from "./types";

/**
 * semantic risks → evidence payloads（风险对策作为可追溯证据摘要）
 */
export function adaptRiskEvidence(
  graph: TenderSemanticGraph,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  return graph.risks.map((risk) => ({
    sourceKind: "risk",
    sourceId: risk.id,
    evidenceType:
      risk.riskType === "compliance"
        ? "certification"
        : risk.riskType === "commercial"
          ? "sla"
          : "datasheet",
    title: `风险对策：${risk.title}`,
    summary: [risk.description, risk.mitigation].filter(Boolean).join(" "),
    confidence:
      risk.severity === "high" ? 0.45 : risk.severity === "medium" ? 0.6 : 0.7,
    coverageStatus: risk.severity === "high" ? "risky" : "partially_evidenced",
    linkedRequirementIds: risk.linkedRequirements,
    linkedScoringItemIds: risk.linkedScoringItems,
    linkedRiskIds: [risk.id],
    trace: "semantic.buildSemanticRisks",
    createdAt: now,
  }));
}
