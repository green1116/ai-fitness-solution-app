import {
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P4_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P4_VERIFY_CHECKS = [
  "HAS_EXECUTION_CLIENT",
  "HAS_EXECUTION_ADAPTER",
  "HAS_EXECUTION_REQUEST",
  "HAS_EXECUTION_RESPONSE",
  "HAS_EXECUTION_ERROR",
  "HAS_EXECUTION_MAPPER",
  "HAS_EXECUTION_VALIDATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_DIRECT_RUNTIME_IMPORT",
  "NO_UI_LOGIC_IN_EXECUTION",
  "NO_RUNTIME_LAYER_MIX",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P4_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P4_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p4",
  status: "quote-execution-client-layer",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  verifyChecks: V57_QUOTE_P4_VERIFY_CHECKS,
  nextHorizon: "UI state mapping refinement (not started)",
  note: "V57 P4 adds execution client boundary between product service and runtime integration",
} as const;
