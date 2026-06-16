import { findBrandByNameOrAlias } from "@/lib/brand-intelligence-network";
import { getAllCatalogProducts } from "@/lib/product-catalog";
import { getAllRealEquipment } from "@/lib/real-catalog-foundation";
import { EPI_CANONICAL_ID } from "../shared/constants";
import type { ProductRecord, ProductRegistry } from "./product-spec-types";

const STUB_PRODUCTS: Omit<ProductRecord, "mode">[] = [
  {
    id: "epi-product-stub-cardio-001",
    skuId: "EPI-STUB-CARDIO-001",
    brandId: "brand-life-fitness",
    name: "Stub Commercial Treadmill",
    category: "cardio",
    source: "real-catalog",
    specifications: [],
  },
  {
    id: "epi-product-stub-strength-001",
    skuId: "EPI-STUB-STRENGTH-001",
    brandId: "brand-matrix",
    name: "Stub Plate-Loaded Station",
    category: "strength",
    source: "real-catalog",
    specifications: [],
  },
  {
    id: "epi-product-stub-functional-001",
    skuId: "EPI-STUB-FUNCTIONAL-001",
    brandId: "brand-technogym",
    name: "Stub Functional Training Rig",
    category: "functional",
    source: "real-catalog",
    specifications: [],
  },
];

function resolveBrandId(brandName: string): string | undefined {
  return findBrandByNameOrAlias(brandName)?.brandId;
}

function catalogProductToRecord(
  product: ReturnType<typeof getAllCatalogProducts>[number],
): ProductRecord {
  return {
    id: `epi-product-catalog-${product.productId}`,
    skuId: product.sku,
    brandId: resolveBrandId(product.brandName),
    name: product.productName,
    category: product.catalogType,
    source: "catalog",
    specifications: [],
    mode: EPI_CANONICAL_ID,
  };
}

function realEquipmentToRecord(
  equipment: ReturnType<typeof getAllRealEquipment>[number],
): ProductRecord {
  return {
    id: `epi-product-real-${equipment.sku.toLowerCase()}`,
    skuId: equipment.sku,
    brandId: equipment.brandId || resolveBrandId(equipment.brandName),
    name: equipment.modelName,
    category: equipment.category,
    source: "real-catalog",
    specifications: [],
    mode: EPI_CANONICAL_ID,
  };
}

let cachedRegistry: ProductRegistry | undefined;

export function buildProductRegistry(): ProductRegistry {
  if (cachedRegistry) return cachedRegistry;

  const bySku = new Map<string, ProductRecord>();

  for (const product of getAllCatalogProducts()) {
    bySku.set(product.sku, catalogProductToRecord(product));
  }

  for (const equipment of getAllRealEquipment()) {
    bySku.set(equipment.sku, realEquipmentToRecord(equipment));
  }

  for (const stub of STUB_PRODUCTS) {
    if (!bySku.has(stub.skuId)) {
      bySku.set(stub.skuId, { ...stub, mode: EPI_CANONICAL_ID });
    }
  }

  cachedRegistry = {
    registryId: "epi-product-registry-v42-p1",
    products: [...bySku.values()],
    mode: EPI_CANONICAL_ID,
  };

  return cachedRegistry;
}

export function findProductById(productId: string): ProductRecord | undefined {
  return buildProductRegistry().products.find((product) => product.id === productId);
}

export function findProductBySku(skuId: string): ProductRecord | undefined {
  return buildProductRegistry().products.find((product) => product.skuId === skuId);
}
