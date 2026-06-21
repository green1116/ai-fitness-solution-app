import {
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P6_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P6_VERIFY_CHECKS = [
  "HAS_PRODUCT_SURFACE",
  "HAS_SURFACE_LOADER",
  "HAS_SURFACE_VIEWMODEL",
  "HAS_SURFACE_STATE",
  "HAS_SURFACE_ACTIONS",
  "HAS_WORKSPACE_SURFACE",
  "HAS_PORTAL_SURFACE",
  "NO_RUNTIME_IMPORT",
  "NO_EXECUTION_LOGIC",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P6_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p6",
  status: "quote-product-surface-assembly",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  verifyChecks: V57_QUOTE_P6_VERIFY_CHECKS,
  nextHorizon: "Status sync (not started)",
  note: "V57 P6 assembles workspace, entry, UI state, product service, and execution into QuoteProductSurface",
} as const;
