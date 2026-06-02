import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { TechnicalEvidence } from "@/lib/tender/compliance/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import type { EvidenceType } from "../types";
import { resolveSemanticRequirementId } from "./dedupe";
import type { NormalizedEvidencePayload } from "./types";

function mapComplianceEvidenceType(type: TechnicalEvidence["type"]): EvidenceType {
  return type;
}

function complianceStatusToCoverage(
  status: string | undefined,
): NormalizedEvidencePayload["coverageStatus"] | undefined {
  if (status === "covered") return "fully_evidenced";
  if (status === "partial" || status === "risky") return "partially_evidenced";
  if (status === "failed") return "unsupported";
  return undefined;
}

/**
 * compliance package → 归一化 evidence payloads
 */
export function adaptComplianceEvidence(
  compliance: TechnicalCompliancePackage,
  graph?: TenderSemanticGraph,
): NormalizedEvidencePayload[] {
  const payloads: NormalizedEvidencePayload[] = [];
  const now = new Date().toISOString();

  for (const ev of compliance.evidence) {
    const reqIds = (ev.relatedRequirementIds || []).map(resolveSemanticRequirementId);
    payloads.push({
      sourceKind: "compliance",
      sourceId: ev.id,
      evidenceType: mapComplianceEvidenceType(ev.type),
      title: ev.title,
      summary: ev.fileRef ? `文件：${ev.fileRef}` : undefined,
      confidence: 0.75,
      skuId: ev.relatedSkuId,
      fileRef: ev.fileRef,
      linkedRequirementIds: reqIds.length ? reqIds : undefined,
      trace: "compliance.buildTechnicalEvidence",
      createdAt: now,
    });
  }

  for (const result of compliance.complianceResults) {
    const semanticId = resolveSemanticRequirementId(result.requirementId);
    const techReq = compliance.requirements.find((r) => r.id === result.requirementId);
    const matrixRow = compliance.matrix.find(
      (m) => m.requirementText === techReq?.requirementText,
    );

    if (result.matchedParameters.length > 0) {
      for (const mp of result.matchedParameters) {
        payloads.push({
          sourceKind: "compliance",
          sourceId: `result-${result.requirementId}-${mp.parameter}`,
          evidenceType: "datasheet",
          title: `参数符合性：${mp.parameter}`,
          summary: `要求 ${mp.required || "—"}；实际 ${mp.actual || "—"}`,
          confidence:
            result.status === "covered"
              ? 0.85
              : result.status === "partial"
                ? 0.55
                : 0.35,
          coverageStatus: complianceStatusToCoverage(result.status),
          linkedRequirementIds: [semanticId],
          matchedField: mp.parameter,
          trace: "compliance.matchSkuParameters",
          createdAt: now,
        });
      }
    }

    if (result.evidenceRequired) {
      payloads.push({
        sourceKind: "compliance",
        sourceId: `evreq-${result.requirementId}`,
        evidenceType: /ISO|认证/.test(techReq?.requirementText || "")
          ? "certification"
          : "test_report",
        title: `符合性证明材料要求 — ${techReq?.requirementText.slice(0, 40) || semanticId}`,
        confidence: 0.5,
        coverageStatus: complianceStatusToCoverage(result.status),
        linkedRequirementIds: [semanticId],
        trace: "compliance.evidenceRequired",
        createdAt: now,
      });
    }

    void matrixRow;
  }

  for (const dev of compliance.deviations) {
    const semanticId = resolveSemanticRequirementId(dev.requirementId);
    payloads.push({
      sourceKind: "compliance",
      sourceId: dev.id,
      evidenceType:
        dev.deviationType === "certification"
          ? "certification"
          : dev.deviationType === "documentation"
            ? "test_report"
            : dev.deviationType === "service"
              ? "sla"
              : "datasheet",
      title: `偏离项：${dev.description.slice(0, 48)}`,
      summary: dev.suggestedFix,
      confidence: 0.4,
      coverageStatus: "risky",
      linkedRequirementIds: [semanticId],
      trace: "compliance.detectDeviation",
      createdAt: now,
    });
  }

  void graph;
  return payloads;
}
