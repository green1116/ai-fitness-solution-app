import bikeData from "@/data/skus/bike.json";
import recoveryData from "@/data/skus/recovery.json";
import strengthData from "@/data/skus/strength.json";
import treadmillData from "@/data/skus/treadmill.json";

import { hydrateSkuParameters } from "./hydrateSkuParameters";
import type { ProductSKU, SkuCategory } from "./skuTypes";

const ALL_SKUS: ProductSKU[] = [
  ...(treadmillData as ProductSKU[]),
  ...(strengthData as ProductSKU[]),
  ...(bikeData as ProductSKU[]),
  ...(recoveryData as ProductSKU[]),
].map(hydrateSkuParameters);

const byId = new Map(ALL_SKUS.map((s) => [s.id, s]));

/**
 * Mock commercial-grade SKU 库（V2.3）
 */
export function getAllSkus(): ProductSKU[] {
  return [...ALL_SKUS];
}

export function getSkuById(id: string): ProductSKU | undefined {
  return byId.get(id);
}

export function getSkusByCategory(category: SkuCategory): ProductSKU[] {
  return ALL_SKUS.filter((s) => s.category === category);
}

export function getSkusByTier(
  category: SkuCategory,
  tier: ProductSKU["productTier"],
): ProductSKU[] {
  return ALL_SKUS.filter(
    (s) => s.category === category && s.productTier === tier,
  );
}
