import { buildTenderResponsePack } from "../response-pack-assembly/builders";
import { RESPONSE_PACK_BIDDER_BRANDS, type ResponsePackBidderBrand } from "../shared/types";

function spreadPercent(values: number[]): number {
  if (values.length < 2) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === 0) return 0;
  return Math.round(((max - min) / max) * 100);
}

export function buildAllVariantPacks(input?: { deploymentId?: string }): {
  responsePacks: ReturnType<typeof buildTenderResponsePack>[];
  variantSpreadScore: number;
} {
  const deploymentId = input?.deploymentId ?? "variant-pack-default";
  const responsePacks = RESPONSE_PACK_BIDDER_BRANDS.map((brand) =>
    buildTenderResponsePack({ deploymentId, bidderBrand: brand }),
  );

  const budgets = responsePacks.map((p) => p.budgetPackage.totalMin);
  const brands = new Set(responsePacks.map((p) => p.bidderBrand));
  const packs = new Set(responsePacks.map((p) => p.commercialPackage.budgetPackage.totalMin));

  const variantSpreadScore = Math.min(
    100,
    Math.round(
      spreadPercent(budgets) * 0.4 +
        (brands.size / 4) * 100 * 0.3 +
        (packs.size / 4) * 100 * 0.3,
    ),
  );

  return { responsePacks, variantSpreadScore };
}
