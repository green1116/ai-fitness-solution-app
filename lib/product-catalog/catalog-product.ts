import { getAllRealEquipment } from "@/lib/real-catalog-foundation";
import type { CatalogProduct, CatalogType, IndustrySector } from "./shared/types";

interface ProductSeed {
  productId: string;
  sku: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
  productName: string;
  brandName: string;
  unitPrice: number;
  leadTimeDays: number;
  availability: CatalogProduct["availability"];
}

const STATIC_PRODUCT_SEEDS: ProductSeed[] = [
  {
    productId: "pc-product-flooring-pu-001",
    sku: "SF-PU-FLOOR-001",
    catalogType: "flooring",
    industrySector: "sports-flooring",
    productName: "PU Sports Flooring System",
    brandName: "Enlio Sports",
    unitPrice: 280,
    leadTimeDays: 21,
    availability: "made-to-order",
  },
  {
    productId: "pc-product-flooring-rubber-002",
    sku: "SF-RUBBER-FLOOR-002",
    catalogType: "flooring",
    industrySector: "sports-flooring",
    productName: "Rubber Gym Flooring Tile",
    brandName: "Regupol",
    unitPrice: 195,
    leadTimeDays: 14,
    availability: "in-stock",
  },
  {
    productId: "pc-product-track-prefab-001",
    sku: "RT-PREFAB-TRACK-001",
    catalogType: "track",
    industrySector: "running-track",
    productName: "Prefabricated Running Track Surface",
    brandName: "Mondo",
    unitPrice: 420,
    leadTimeDays: 45,
    availability: "made-to-order",
  },
  {
    productId: "pc-product-turf-fifa-001",
    sku: "AT-FIFA-TURF-001",
    catalogType: "turf",
    industrySector: "artificial-turf",
    productName: "FIFA Quality Pro Artificial Turf",
    brandName: "FieldTurf",
    unitPrice: 360,
    leadTimeDays: 35,
    availability: "import-lead-time",
  },
  {
    productId: "pc-product-construction-steel-001",
    sku: "SH-STEEL-FRAME-001",
    catalogType: "construction",
    industrySector: "sports-hall",
    productName: "Sports Hall Steel Frame Kit",
    brandName: "AI Fitness Engineering",
    unitPrice: 1250000,
    leadTimeDays: 60,
    availability: "made-to-order",
  },
  {
    productId: "pc-product-service-ops-001",
    sku: "FC-OPS-SERVICE-001",
    catalogType: "service",
    industrySector: "fitness-center",
    productName: "Fitness Center Operation Service Package",
    brandName: "AI Fitness Solution",
    unitPrice: 85000,
    leadTimeDays: 7,
    availability: "in-stock",
  },
];

function seedToProduct(seed: ProductSeed): CatalogProduct {
  return {
    productId: seed.productId,
    sku: seed.sku,
    catalogType: seed.catalogType,
    industrySector: seed.industrySector,
    productName: seed.productName,
    brandName: seed.brandName,
    unitPrice: seed.unitPrice,
    currency: "CNY",
    leadTimeDays: seed.leadTimeDays,
    availability: seed.availability,
    productReady: true,
    mode: "product-catalog",
  };
}

function realEquipmentToProduct(
  equipment: ReturnType<typeof getAllRealEquipment>[number],
): CatalogProduct {
  return {
    productId: `pc-product-${equipment.sku.toLowerCase()}`,
    sku: equipment.sku,
    catalogType: "equipment",
    industrySector: "gym-equipment",
    productName: equipment.modelName,
    brandName: equipment.brandName,
    unitPrice: 0,
    currency: "CNY",
    leadTimeDays: equipment.leadTimeDays,
    availability: equipment.procurementAvailability,
    productReady: true,
    mode: "product-catalog",
  };
}

export function buildCatalogProduct(input: {
  productId: string;
  sku: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
  productName: string;
  brandName: string;
  unitPrice: number;
  leadTimeDays: number;
  availability?: CatalogProduct["availability"];
}): CatalogProduct {
  return {
    productId: input.productId,
    sku: input.sku,
    catalogType: input.catalogType,
    industrySector: input.industrySector,
    productName: input.productName,
    brandName: input.brandName,
    unitPrice: input.unitPrice,
    currency: "CNY",
    leadTimeDays: input.leadTimeDays,
    availability: input.availability ?? "made-to-order",
    productReady: input.productName.length > 0,
    mode: "product-catalog",
  };
}

export function buildCatalogProductFromSku(sku: string): CatalogProduct | undefined {
  const staticProduct = STATIC_PRODUCT_SEEDS.find((seed) => seed.sku === sku);
  if (staticProduct) return seedToProduct(staticProduct);

  const equipment = getAllRealEquipment().find((entry) => entry.sku === sku);
  if (equipment) return realEquipmentToProduct(equipment);

  return undefined;
}

export function getAllCatalogProducts(): CatalogProduct[] {
  const staticProducts = STATIC_PRODUCT_SEEDS.map(seedToProduct);
  const equipmentProducts = getAllRealEquipment().map(realEquipmentToProduct);
  return [...staticProducts, ...equipmentProducts];
}

export function getCatalogProductsByType(catalogType: CatalogType): CatalogProduct[] {
  return getAllCatalogProducts().filter((product) => product.catalogType === catalogType);
}

export function getCatalogProductsBySector(industrySector: IndustrySector): CatalogProduct[] {
  return getAllCatalogProducts().filter((product) => product.industrySector === industrySector);
}
