import type { ProductSku } from "@/lib/commercial-products/shared/constants";

export const CP_ACCESS_VERSION = "v47-commercial-products-p2-step4" as const;
export const CP_ACCESS_CANONICAL_ID = "commercial-products-access" as const;
export const CP_P2_TAG = CP_ACCESS_VERSION;
export const CP_P2_PHASE = 2 as const;
export const CP_P2_STEP = 4 as const;

export const CP_P1_LAYER = "v47-commercial-products-p1" as const;

export const CP_QUOTE_API_PATH = "/api/commercial-products/quote" as const;
export const CP_DOWNLOAD_API_PATH = "/api/commercial-products/pdf/deliverable" as const;
export const CP_SUMMARY_PDF_API_PATH = "/api/commercial-products/pdf/summary" as const;
export const CP_PORTAL_BASE_PATH = "/commercial/v47" as const;
export const CP_MIN_PORTAL_PRODUCT_COUNT = 3 as const;

export interface SkuEligibilityRule {
  minArea: number;
  minHeadcount: number;
  minBudgetCny: number;
  maxBudgetCny: number;
}

export const SKU_ELIGIBILITY_RULES: Record<ProductSku, SkuEligibilityRule> = {
  "kickstart-package": {
    minArea: 80,
    minHeadcount: 30,
    minBudgetCny: 200_000,
    maxBudgetCny: 3_000_000,
  },
  "tender-ready-package": {
    minArea: 150,
    minHeadcount: 80,
    minBudgetCny: 400_000,
    maxBudgetCny: 8_000_000,
  },
  "delivery-intelligence-package": {
    minArea: 200,
    minHeadcount: 100,
    minBudgetCny: 600_000,
    maxBudgetCny: 15_000_000,
  },
};
