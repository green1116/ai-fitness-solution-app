import type { TenderResponsePackage } from "@/lib/tender/response/types";

import type { EvidenceType } from "../types";
import type { NormalizedEvidencePayload } from "./types";

function blockTypeToEvidenceType(
  type: string,
  ref: string,
): EvidenceType {
  if (/ISO|认证|资质/.test(ref)) return "certification";
  if (/检测|报告/.test(ref)) return "test_report";
  if (/案例|业绩/.test(ref)) return "case_study";
  if (/质保|保修/.test(ref)) return "warranty";
  if (/SLA|售后/.test(ref)) return "sla";
  if (type === "attachment") return "datasheet";
  return "datasheet";
}

/**
 * Response Composer 输出块 → evidence payloads
 */
export function adaptResponseEvidence(
  responses: TenderResponsePackage,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  const allBlocks = [
    ...responses.technicalBlocks,
    ...responses.commercialBlocks,
    ...responses.scoringBlocks,
    ...responses.riskBlocks,
    ...responses.attachmentBlocks,
  ];

  const payloads: NormalizedEvidencePayload[] = [];

  for (const block of allBlocks) {
    payloads.push({
      sourceKind: "response",
      sourceId: block.id,
      evidenceType:
        block.type === "risk"
          ? "sla"
          : block.type === "scoring"
            ? "case_study"
            : block.type === "attachment"
              ? "datasheet"
              : "datasheet",
      title: block.title,
      summary: block.content.slice(0, 320),
      confidence:
        block.confidence === "high"
          ? 0.82
          : block.confidence === "medium"
            ? 0.62
            : 0.42,
      coverageStatus:
        block.confidence === "high"
          ? "fully_evidenced"
          : block.confidence === "low"
            ? "risky"
            : "partially_evidenced",
      linkedRequirementIds: block.relatedRequirementIds,
      linkedScoringItemIds: block.relatedScoringItemIds,
      linkedRiskIds: block.relatedRiskIds,
      trace: `response.compose.${block.type}`,
      createdAt: now,
    });

    for (const ref of block.evidenceRefs || []) {
      payloads.push({
        sourceKind: "response",
        sourceId: `${block.id}-ref-${ref.slice(0, 16)}`,
        evidenceType: blockTypeToEvidenceType(block.type, ref),
        title: ref,
        summary: `响应块 ${block.title} 引用材料`,
        confidence: 0.68,
        linkedRequirementIds: block.relatedRequirementIds,
        linkedScoringItemIds: block.relatedScoringItemIds,
        trace: "response.block.evidenceRefs",
        createdAt: now,
      });
    }
  }

  for (const item of responses.attachmentIndex) {
    payloads.push({
      sourceKind: "response",
      sourceId: `att-${item.title.slice(0, 20)}`,
      evidenceType: /案例/.test(item.title)
        ? "case_study"
        : /认证|ISO/.test(item.title)
          ? "certification"
          : "datasheet",
      title: item.title,
      summary: item.reason,
      confidence: 0.6,
      linkedRequirementIds: item.linkedRequirementIds,
      linkedScoringItemIds: item.linkedScoringItemIds,
      trace: "response.attachmentIndex",
      createdAt: now,
    });
  }

  return payloads;
}
