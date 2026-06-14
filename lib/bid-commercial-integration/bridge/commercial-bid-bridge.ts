import { buildRealCatalogBundle } from "@/lib/real-catalog-foundation";
import { buildCommercialBundle } from "@/lib/procurement-intelligence";
import { buildSupplierNetworkBundle } from "@/lib/regional-supplier-foundation";
import type { BidCommercialBundle, ProjectType } from "../shared/types";

export function buildBidCommercialBundle(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): BidCommercialBundle {
  const { sku, city, quantity, projectType } = input;

  const catalog = buildRealCatalogBundle(sku);
  const brand =
    catalog?.equipment?.brandName ?? catalog?.brand?.brandName ?? "";

  const supplierNetwork = buildSupplierNetworkBundle({ brand, city, sku });
  const commercial = buildCommercialBundle({ sku, city, quantity, projectType });

  const checks = [
    catalog !== null,
    supplierNetwork.supplier.length > 0,
    supplierNetwork.inventory.length > 0,
    supplierNetwork.service.length > 0,
    catalog?.pricing !== undefined,
    commercial.procurement.finalPrice > 0,
    commercial.leadTime !== undefined,
  ];
  const layerReadiness = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const readinessScore = Math.round(
    (layerReadiness +
      supplierNetwork.bundleReadiness +
      commercial.procurement.bundleReadiness) /
      3,
  );

  return {
    bundleId: `bid-commercial-${sku}-${city}-${projectType}-q${quantity}`
      .replace(/\s+/g, "-")
      .toLowerCase(),
    sku,
    city,
    quantity,
    projectType,
    catalog,
    supplierNetwork,
    procurement: commercial.procurement,
    finalPrice: commercial.finalPrice,
    savings: commercial.savings,
    leadTime: commercial.leadTime,
    readinessScore,
  };
}
