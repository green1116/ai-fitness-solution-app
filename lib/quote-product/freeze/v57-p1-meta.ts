import {
  WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  WORKSPACE_QUOTE_PRODUCT_VERSION,
} from "../shared/quote-product-constants";

export { WORKSPACE_QUOTE_PRODUCT_P1_TAG } from "../shared/quote-product-constants";

export const V57_QUOTE_P1_VERIFY_CHECKS = [
  "HAS_PRODUCT_LAYER",
  "HAS_WORKSPACE_UI",
  "HAS_ENTRY_LAYER",
  "HAS_PRODUCT_SERVICE",
  "HAS_EXECUTION_BRIDGE",
  "NO_DIRECT_EXECUTION_IMPORT",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
] as const;

export const WORKSPACE_QUOTE_PRODUCT_P1_META = {
  tag: WORKSPACE_QUOTE_PRODUCT_P1_TAG,
  version: WORKSPACE_QUOTE_PRODUCT_VERSION,
  phase: "v57-quote-product-p1",
  status: "quote-workspace-bootstrap-ui",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
  verifyChecks: V57_QUOTE_P1_VERIFY_CHECKS,
  nextHorizon: "Quote entry layer (not started)",
  note: "V57 P1 bootstraps quote workspace UI models and V56 execution client bridge",
} as const;
