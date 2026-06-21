import {
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P3_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P3_VERIFY_CHECKS = [
  "HAS_PRODUCT_SERVICE",
  "HAS_PRODUCT_ORCHESTRATOR",
  "HAS_WORKSPACE_RESOLVER",
  "HAS_RUNTIME_CLIENT_ONLY",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_DIRECT_EXECUTION_IMPORT",
  "NO_UI_LOGIC_IN_SERVICE",
  "NO_RUNTIME_LAYER_MIX",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P3_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P3_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p3",
  status: "quote-product-service-layer",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  verifyChecks: V57_QUOTE_P3_VERIFY_CHECKS,
  nextHorizon: "Execution client bridge refinement (not started)",
  note: "V57 P3 adds quote product service orchestration, workspace resolution, and result mapping",
} as const;
