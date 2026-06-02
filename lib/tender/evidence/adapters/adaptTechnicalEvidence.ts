import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import { resolveSemanticRequirementId } from "./dedupe";
import type { NormalizedEvidencePayload } from "./types";

/**
 * 技术响应 / 符合性响应文本 → 可追溯 evidence 摘要
 */
export function adaptTechnicalEvidence(
  compliance: TechnicalCompliancePackage,
  graph?: TenderSemanticGraph,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  const payloads: NormalizedEvidencePayload[] = [];

  compliance.responses.forEach((text, idx) => {
    const techReq = compliance.requirements[idx];
    if (!techReq) return;
    const semanticId = resolveSemanticRequirementId(techReq.id);
    const result = compliance.complianceResults.find(
      (r) => r.requirementId === techReq.id,
    );

    payloads.push({
      sourceKind: "technical",
      sourceId: `response-${techReq.id}`,
      evidenceType: "datasheet",
      title: `技术响应摘要 — ${techReq.requirementText.slice(0, 36)}`,
      summary: text.slice(0, 280),
      confidence:
        result?.status === "covered"
          ? 0.8
          : result?.status === "partial"
            ? 0.6
            : 0.45,
      coverageStatus:
        result?.status === "covered"
          ? "fully_evidenced"
          : result?.status === "failed"
            ? "unsupported"
            : "partially_evidenced",
      linkedRequirementIds: [semanticId],
      trace: "compliance.composeComplianceResponse",
      createdAt: now,
    });
  });

  if (graph) {
    const technical = graph.requirements.filter(
      (r) => r.category === "technical" || r.measurable,
    );
    for (const req of technical) {
      if (payloads.some((p) => p.linkedRequirementIds?.includes(req.id))) continue;
      payloads.push({
        sourceKind: "technical",
        sourceId: `semantic-${req.id}`,
        evidenceType: "datasheet",
        title: `技术要求：${req.title || req.requirement.slice(0, 32)}`,
        summary: req.normalizedRequirement,
        confidence: req.measurable ? 0.7 : 0.5,
        linkedRequirementIds: [req.id],
        matchedField: req.measurableFields?.[0],
        trace: "semantic.requirement.technical",
        createdAt: now,
      });
    }
  }

  return payloads;
}
