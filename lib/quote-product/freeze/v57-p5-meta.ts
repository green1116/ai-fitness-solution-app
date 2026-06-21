import {
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P5_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P5_VERIFY_CHECKS = [
  "HAS_UI_STATE",
  "HAS_UI_MAPPER",
  "HAS_VIEW_MODEL",
  "HAS_READINESS",
  "HAS_LOADING_STATE",
  "HAS_ERROR_SURFACE",
  "NO_RUNTIME_IMPORT",
  "NO_EXECUTION_LOGIC",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P5_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P5_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p5",
  status: "quote-ui-state-mapping",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  verifyChecks: V57_QUOTE_P5_VERIFY_CHECKS,
  nextHorizon: "Status sync (not started)",
  note: "V57 P5 adds unified UI state mapping boundary for quote product surface",
} as const;
