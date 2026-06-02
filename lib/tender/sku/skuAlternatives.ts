import { getSkusByCategory } from "./skuDatabase";
import type { ProductSKU, SkuComplianceStatus } from "./skuTypes";
import { evaluateSkuCompliance, parseRequirementSpec } from "./skuCompliance";
import type { SemanticRequirement } from "@/lib/tender/semantic/types";

/**
 * 同等级替代 SKU（缺货 / 交期 / 参数不足时）
 */
export function findAlternativeSkus(
  primary: ProductSKU,
  req: SemanticRequirement,
  excludeIds: string[] = [],
): ProductSKU[] {
  const candidates = getSkusByCategory(primary.category).filter(
    (s) => s.id !== primary.id && !excludeIds.includes(s.id),
  );

  const scored = candidates
    .map((sku) => {
      const ev = evaluateSkuCompliance(req, sku);
      const tierMatch = sku.productTier === primary.productTier ? 2 : 1;
      const complianceRank: Record<SkuComplianceStatus, number> = {
        covered: 4,
        partial: 3,
        risky: 2,
        missing: 1,
      };
      return {
        sku,
        score:
          complianceRank[ev.compliance] * 10 +
          tierMatch +
          (sku.leadTimeDays ?? 99) * -0.01,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.sku);
}

export function formatAlternativeLabel(skus: ProductSKU[]): string {
  return skus.map((s) => `${s.brand} ${s.model}`).join("；");
}
