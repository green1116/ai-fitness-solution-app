import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import type { NormalizedEvidencePayload } from "./types";

/**
 * scoring items → evidence payloads（评分支撑材料提示）
 */
export function adaptScoringEvidence(
  graph: TenderSemanticGraph,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  const payloads: NormalizedEvidencePayload[] = [];

  for (const item of graph.scoringItems) {
    payloads.push({
      sourceKind: "scoring",
      sourceId: item.id,
      evidenceType: /案例|业绩/.test(item.title)
        ? "case_study"
        : /服务|SLA|售后/.test(item.title)
          ? "sla"
          : /认证|资质/.test(item.title)
            ? "certification"
            : "datasheet",
      title: `评分支撑：${item.title.slice(0, 56)}`,
      summary: [
        item.evaluationFocus.length
          ? `评审关注：${item.evaluationFocus.join("、")}`
          : "",
        item.evidenceNeeded.length
          ? `建议材料：${item.evidenceNeeded.join("、")}`
          : "",
      ]
        .filter(Boolean)
        .join("；"),
      confidence: 0.65,
      coverageStatus: "partially_evidenced",
      linkedScoringItemIds: [item.id],
      trace: "semantic.buildSemanticScoringItems",
      createdAt: now,
    });

    for (const evName of item.evidenceNeeded) {
      payloads.push({
        sourceKind: "scoring",
        sourceId: `${item.id}-ev-${evName.slice(0, 12)}`,
        evidenceType: /案例/.test(evName)
          ? "case_study"
          : /报告|检测/.test(evName)
            ? "test_report"
            : "datasheet",
        title: evName,
        summary: `支撑评分项：${item.title.slice(0, 32)}`,
        confidence: 0.6,
        linkedScoringItemIds: [item.id],
        trace: "semantic.scoring.evidenceNeeded",
        createdAt: now,
      });
    }
  }

  return payloads;
}
