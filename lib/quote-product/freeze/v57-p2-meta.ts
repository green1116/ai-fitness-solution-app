import {
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P2_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P2_VERIFY_CHECKS = [
  "HAS_ENTRY_LAYER",
  "HAS_ENTRY_CONTROLLER",
  "HAS_ENTRY_MAPPER",
  "HAS_ENTRY_UI_STATE",
  "HAS_ENTRY_VALIDATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_DIRECT_EXECUTION_IMPORT",
  "NO_RUNTIME_LAYER_MIX",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P2_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P2_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p2",
  status: "quote-entry-layer",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  verifyChecks: V57_QUOTE_P2_VERIFY_CHECKS,
  nextHorizon: "Product service layer (not started)",
  note: "V57 P2 adds quote entry controller, submission flow, UI state mapping, and portal hook",
} as const;
