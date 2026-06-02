import type { ProductSKU } from "@/lib/tender/sku/skuTypes";

import type { ComplianceResult, TechnicalEvidence, TechnicalRequirement } from "./types";

let evidenceSeq = 0;

function nextId(): string {
  evidenceSeq += 1;
  return `EVD-${String(evidenceSeq).padStart(4, "0")}`;
}

const FILE_TYPE_MAP: { pattern: RegExp; type: TechnicalEvidence["type"]; title: string }[] = [
  { pattern: /型式|检测|检验|test/i, type: "test_report", title: "检测报告" },
  { pattern: /ISO|CE|认证|证书/, type: "certification", title: "体系/产品认证" },
  { pattern: /参数|datasheet|规格/, type: "datasheet", title: "产品参数表" },
  { pattern: /质保|保修|warranty/i, type: "warranty", title: "质保承诺" },
  { pattern: /案例|业绩|合同/, type: "case_study", title: "类似业绩材料" },
];

/**
 * 从 SKU + 符合性结果推断技术证据清单
 */
export function buildTechnicalEvidence(
  requirements: TechnicalRequirement[],
  results: ComplianceResult[],
  skus: ProductSKU[],
): TechnicalEvidence[] {
  const evidence: TechnicalEvidence[] = [];
  const needsEvidence = new Set(
    results.filter((r) => r.evidenceRequired).map((r) => r.requirementId),
  );

  for (const sku of skus) {
    for (const file of sku.evidenceFiles || []) {
      const rule =
        FILE_TYPE_MAP.find((r) => r.pattern.test(file)) ||
        ({ type: "datasheet" as const, title: file });
      evidence.push({
        id: nextId(),
        type: rule.type,
        title: `${sku.brand} ${sku.model} — ${rule.title}`,
        relatedSkuId: sku.id,
        fileRef: file,
      });
    }
  }

  for (const req of requirements) {
    if (!needsEvidence.has(req.id)) continue;
    if (/ISO|认证/.test(req.requirementText)) {
      evidence.push({
        id: nextId(),
        type: "certification",
        title: `符合性认证材料 — ${req.requirementText.slice(0, 32)}`,
        relatedRequirementIds: [req.id],
        fileRef: "certification-pack.pdf",
      });
    }
    if (/检测|报告/.test(req.requirementText)) {
      evidence.push({
        id: nextId(),
        type: "test_report",
        title: `检测报告 — ${req.requirementText.slice(0, 32)}`,
        relatedRequirementIds: [req.id],
        fileRef: "test-report.pdf",
      });
    }
  }

  const seen = new Set<string>();
  return evidence.filter((e) => {
    const k = `${e.type}|${e.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
