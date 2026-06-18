import {
  CP_CANONICAL_ID,
  CP_MIN_PRODUCT_COUNT,
  SKU_PRICE_BANDS,
  type DeliverableType,
  type ProductSku,
  type SlaTier,
} from "../shared/constants";
import type { ProductCatalogEntry, ProductCatalogRegistry } from "../shared/types";

const KICKSTART_DELIVERABLES: DeliverableType[] = [
  "plan-pdf",
  "budget-pdf",
  "brand-summary",
  "risk-summary",
];

const TENDER_READY_DELIVERABLES: DeliverableType[] = [
  ...KICKSTART_DELIVERABLES,
  "procurement-summary",
  "tender-summary",
];

const DELIVERY_DELIVERABLES: DeliverableType[] = [
  ...TENDER_READY_DELIVERABLES,
  "delivery-report",
];

const CATALOG_DEFINITIONS: Array<{
  sku: ProductSku;
  name: string;
  description: string;
  inputs: string[];
  deliverables: DeliverableType[];
  slaTier: SlaTier;
}> = [
  {
    sku: "kickstart-package",
    name: "Kickstart Package",
    description: "企业健身空间方案启动交付包：方案、预算、品牌与风险摘要。",
    inputs: ["项目名称", "面积", "人数", "预算"],
    deliverables: KICKSTART_DELIVERABLES,
    slaTier: SKU_PRICE_BANDS["kickstart-package"].defaultSla,
  },
  {
    sku: "tender-ready-package",
    name: "Tender Ready Package",
    description: "投标就绪交付包：在 Kickstart 基础上增加采购与招标摘要。",
    inputs: ["项目名称", "面积", "人数", "预算", "招标要求"],
    deliverables: TENDER_READY_DELIVERABLES,
    slaTier: SKU_PRICE_BANDS["tender-ready-package"].defaultSla,
  },
  {
    sku: "delivery-intelligence-package",
    name: "Delivery Intelligence Package",
    description: "交付智能报告包：覆盖招标、采购、交付与绩效优化全链路摘要。",
    inputs: ["项目名称", "面积", "人数", "预算", "交付里程碑"],
    deliverables: DELIVERY_DELIVERABLES,
    slaTier: SKU_PRICE_BANDS["delivery-intelligence-package"].defaultSla,
  },
];

let cachedRegistry: ProductCatalogRegistry | undefined;

export function buildProductCatalog(): ProductCatalogRegistry {
  if (cachedRegistry) return cachedRegistry;

  const records: ProductCatalogEntry[] = CATALOG_DEFINITIONS.map((definition) => {
    const band = SKU_PRICE_BANDS[definition.sku];
    return {
      sku: definition.sku,
      name: definition.name,
      description: definition.description,
      inputs: definition.inputs,
      outputs: definition.deliverables,
      deliverables: definition.deliverables,
      slaTier: definition.slaTier,
      priceMinCny: band.minCny,
      priceMaxCny: band.maxCny,
    };
  });

  cachedRegistry = {
    registryId: "cp-product-catalog-v47-p1",
    records,
    count: records.length,
    mode: CP_CANONICAL_ID,
  };

  return cachedRegistry;
}

export function getProductCatalogEntry(sku: ProductSku): ProductCatalogEntry {
  const entry = buildProductCatalog().records.find((record) => record.sku === sku);
  if (!entry) {
    throw new Error(`Unknown product SKU: ${sku}`);
  }
  return entry;
}

export function assertProductCatalogReady(): boolean {
  return buildProductCatalog().count >= CP_MIN_PRODUCT_COUNT;
}
