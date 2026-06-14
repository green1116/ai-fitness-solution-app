import { buildRealCatalogBundle } from "@/lib/real-catalog-foundation";
import { buildSupplierNetworkBundle } from "@/lib/regional-supplier-foundation";
import type { CommercialBundle, ProjectType } from "../shared/types";
import { buildProcurementBundle } from "./procurement-bridge";

const CITY_TO_REGION: Record<string, string> = {
  Shanghai: "East China",
  Beijing: "North China",
  Guangzhou: "South China",
  Chengdu: "Southwest China",
  Wuhan: "Central China",
};

export function resolveRegionFromCity(city: string): string {
  return CITY_TO_REGION[city] ?? "East China";
}

export function buildCommercialBundle(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): CommercialBundle {
  const { sku, city, quantity, projectType } = input;
  const region = resolveRegionFromCity(city);

  const catalog = buildRealCatalogBundle(sku);
  const brand =
    catalog?.equipment?.brandName ?? catalog?.brand?.brandName ?? "";

  const supplierNetwork = buildSupplierNetworkBundle({ brand, city, sku });
  const procurement = buildProcurementBundle({ sku, region, projectType, quantity });

  const finalPrice = procurement.finalPrice;
  const savings = procurement.savings;
  const leadTime = procurement.leadTime;

  const checks = [
    catalog !== null,
    supplierNetwork.supplier.length > 0,
    supplierNetwork.inventory.length > 0,
    supplierNetwork.service.length > 0,
    catalog?.pricing !== undefined,
    procurement.finalPrice > 0,
  ];
  const layerReadiness = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const readinessScore = Math.round(
    (layerReadiness + supplierNetwork.bundleReadiness + procurement.bundleReadiness) / 3,
  );

  return {
    bundleId: `commercial-bundle-${sku}-${city}-${projectType}-q${quantity}`
      .replace(/\s+/g, "-")
      .toLowerCase(),
    sku,
    city,
    quantity,
    projectType,
    region,
    catalog,
    supplierNetwork,
    procurement,
    finalPrice,
    savings,
    leadTime,
    readinessScore,
  };
}
