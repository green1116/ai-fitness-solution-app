export const COMMERCIAL_PRODUCTS_VERSION = "v47-commercial-products-p1" as const;
export const CP_CANONICAL_ID = "commercial-products" as const;
export type CommercialProductsMode = typeof CP_CANONICAL_ID;
export const CP_P1_TAG = COMMERCIAL_PRODUCTS_VERSION;
export const CP_P1_PHASE = 1 as const;

export const CP_UPSTREAM_INTELLIGENCE_LAYER = "v38-v46-intelligence-foundation" as const;

export const PRODUCT_SKU = [
  "kickstart-package",
  "tender-ready-package",
  "delivery-intelligence-package",
] as const;
export type ProductSku = (typeof PRODUCT_SKU)[number];

export const DELIVERABLE_TYPE = [
  "plan-pdf",
  "budget-pdf",
  "brand-summary",
  "risk-summary",
  "procurement-summary",
  "tender-summary",
  "delivery-report",
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPE)[number];

export const SLA_TIER = ["48h", "72h", "7d", "14d"] as const;
export type SlaTier = (typeof SLA_TIER)[number];

export const PROJECT_COMPLEXITY = ["low", "medium", "high"] as const;
export type ProjectComplexity = (typeof PROJECT_COMPLEXITY)[number];

export const PAYMENT_MILESTONE = ["deposit", "acceptance"] as const;
export type PaymentMilestone = (typeof PAYMENT_MILESTONE)[number];

export const CP_MIN_PRODUCT_COUNT = 3 as const;
export const CP_MIN_DELIVERABLE_COUNT = 3 as const;

export const SKU_PRICE_BANDS: Record<
  ProductSku,
  { minCny: number; maxCny: number; defaultSla: SlaTier }
> = {
  "kickstart-package": { minCny: 18_000, maxCny: 28_000, defaultSla: "7d" },
  "tender-ready-package": { minCny: 38_000, maxCny: 58_000, defaultSla: "14d" },
  "delivery-intelligence-package": { minCny: 48_000, maxCny: 68_000, defaultSla: "14d" },
};
