import {
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  WORKSPACE_QUOTE_PRODUCT_P7_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P7_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P7_VERIFY_CHECKS = [
  "HAS_SINGLE_PORTAL_ENTRY",
  "HAS_SURFACE_ONLY_RENDERING",
  "NO_LEGACY_ENTRY_ROUTE",
  "NO_DIRECT_SERVICE_ACCESS_FROM_UI",
  "NO_EXECUTION_CLIENT_IN_UI",
  "NO_RUNTIME_IMPORT_IN_UI",
  "HAS_LOADER_HYDRATION",
  "HAS_ROUTE_CONSOLIDATION",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P7_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P7_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p7",
  status: "portal-wiring-final",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P6_TAG,
  verifyChecks: V57_QUOTE_P7_VERIFY_CHECKS,
  nextHorizon: "Full portal integration verification (not started)",
  note: "V57 P7 consolidates portal routes and enforces QuoteProductSurface as the only UI entry",
} as const;
