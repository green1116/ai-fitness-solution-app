import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import type { NormalizedEvidencePayload } from "./types";

/**
 * 资格/附件类要求 → certification / case_study evidence
 */
export function adaptQualificationEvidence(
  graph: TenderSemanticGraph,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  const qual = graph.requirements.filter(
    (r) =>
      r.category === "qualification" ||
      r.category === "attachment" ||
      r.evidenceRequired,
  );

  return qual.map((req) => ({
    sourceKind: "qualification",
    sourceId: req.id,
    evidenceType: /ISO|认证|资质|证书/.test(req.requirement)
      ? "certification"
      : /案例|业绩|合同/.test(req.requirement)
        ? "case_study"
        : /质保|保修/.test(req.requirement)
          ? "warranty"
          : /检测|报告/.test(req.requirement)
            ? "test_report"
            : "datasheet",
    title: `资格/证明：${req.title || req.requirement.slice(0, 40)}`,
    summary: req.normalizedRequirement || req.requirement,
    confidence: req.evidenceRequired ? 0.55 : 0.65,
    coverageStatus: req.evidenceRequired
      ? "partially_evidenced"
      : "fully_evidenced",
    linkedRequirementIds: [req.id],
    matchedField: req.measurableFields?.[0],
    trace: "semantic.requirement.qualification",
    createdAt: now,
  }));
}
