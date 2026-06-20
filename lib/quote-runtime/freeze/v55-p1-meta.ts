import {
  V54_WORKSPACE_BUSINESS_FINAL_DEPENDENCY_TAG,
  WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  WORKSPACE_QUOTE_RUNTIME_VERSION,
} from "../shared/quote-constants";

export const V55_QUOTE_P1_VERIFY_CHECKS = [
  "HAS_QUOTE_BRIDGE",
  "HAS_QUOTE_CONTEXT",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_WORKFLOW_RUNTIME",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P1_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  phase: "v55-workspace-quote-p1",
  status: "quote-bridge-foundation",
  frozen: false,
  dependencyTag: V54_WORKSPACE_BUSINESS_FINAL_DEPENDENCY_TAG,
  verifyChecks: V55_QUOTE_P1_VERIFY_CHECKS,
  nextHorizon: "Quote context foundation (not started)",
  note: "V55 P1 quote bridge on frozen V54 business entry and quote surface only",
} as const;
