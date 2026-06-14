import { buildBidCommercialBundle } from "@/lib/bid-commercial-integration";
import type { ProposalIntelligenceInput, ProposalScoreBreakdown } from "../shared/types";

function computeCatalogScore(
  catalog: ReturnType<typeof buildBidCommercialBundle>["catalog"],
): number {
  if (!catalog) return 0;
  const checks = [
    catalog.brand !== null && catalog.brand !== undefined,
    catalog.equipment !== undefined,
    catalog.pricing !== undefined,
    catalog.maintenance !== undefined,
    catalog.replacement !== undefined,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function buildProposalScore(input: ProposalIntelligenceInput): ProposalScoreBreakdown {
  const bundle = buildBidCommercialBundle(input);

  const catalogScore = computeCatalogScore(bundle.catalog);

  let supplierScore = bundle.supplierNetwork.bundleReadiness;
  if (bundle.supplierNetwork.supplier.length <= 1) {
    supplierScore = Math.min(supplierScore, 70);
  }

  const listPrice = bundle.procurement.channelPricing.listPrice;
  const savingsRate = listPrice > 0 ? bundle.savings / listPrice : 0;
  const procurementScore = Math.min(
    100,
    Math.round(60 + savingsRate * 150 + (bundle.procurement.discountRule ? 10 : 0)),
  );

  const totalInventory = bundle.supplierNetwork.inventory.reduce(
    (sum, entry) => sum + entry.availableQuantity,
    0,
  );
  const inventoryRatio = input.quantity > 0 ? totalInventory / input.quantity : 0;
  const leadDays = bundle.leadTime?.leadTimeDays ?? 30;

  let deliveryScore = 100;
  if (leadDays > 21) deliveryScore -= 40;
  else if (leadDays > 14) deliveryScore -= 20;
  else if (leadDays <= 7) deliveryScore = Math.min(100, deliveryScore);

  if (inventoryRatio < 1) deliveryScore -= 35;
  else if (inventoryRatio < 1.5) deliveryScore -= 15;
  else if (inventoryRatio >= 2) deliveryScore = Math.min(100, deliveryScore + 5);

  deliveryScore = Math.max(0, Math.min(100, deliveryScore));

  const serviceCount = bundle.supplierNetwork.service.length;
  let coverageScore = Math.min(
    100,
    50 + serviceCount * 12 + (bundle.supplierNetwork.coverage ? 18 : 0),
  );
  if (bundle.supplierNetwork.supplier.length <= 1) {
    coverageScore = Math.min(coverageScore, 80);
  }

  const score = Math.round(
    (catalogScore + supplierScore + procurementScore + deliveryScore + coverageScore) / 5,
  );

  const concentrationPenalty =
    bundle.supplierNetwork.supplier.length <= 1 ? 4 : 0;

  return {
    score: Math.max(0, score - concentrationPenalty),
    catalogScore,
    supplierScore,
    procurementScore,
    deliveryScore,
    coverageScore,
  };
}
