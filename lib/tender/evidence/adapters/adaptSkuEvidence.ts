import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";

import type { NormalizedEvidencePayload } from "./types";

/**
 * SKU 库 evidenceFiles → registry payloads
 */
export function adaptSkuEvidence(
  skuResult: SKUIntelligenceResult,
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();
  const payloads: NormalizedEvidencePayload[] = [];

  const skus = [
    ...skuResult.recommendedSkus,
    ...skuResult.alternativeSkus,
  ];

  for (const sku of skus) {
    for (const file of sku.evidenceFiles || []) {
      const type = /检测|检验|报告/.test(file)
        ? "test_report"
        : /ISO|CE|认证/.test(file)
          ? "certification"
          : /案例|业绩/.test(file)
            ? "case_study"
            : "datasheet";

      const mapping = skuResult.mappings.find((m) => m.skuId === sku.id);

      payloads.push({
        sourceKind: "sku",
        sourceId: `${sku.id}-${file}`,
        evidenceType: type,
        title: `${sku.brand} ${sku.model} — ${file}`,
        summary: `SKU 库登记材料`,
        confidence: 0.78,
        brand: sku.brand,
        skuId: sku.id,
        fileRef: file,
        linkedRequirementIds: mapping?.requirementId
          ? [mapping.requirementId]
          : undefined,
        trace: "sku.database.evidenceFiles",
        createdAt: now,
      });
    }
  }

  return payloads;
}
