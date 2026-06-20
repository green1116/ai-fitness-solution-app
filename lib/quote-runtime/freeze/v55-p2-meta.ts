import {
  WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  WORKSPACE_QUOTE_RUNTIME_VERSION,
} from "../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P2_TAG = "v55-workspace-quote-p2" as const;

export const WORKSPACE_QUOTE_CONTEXT_VERSION = "v55-p2" as const;

export const V55_QUOTE_P2_VERIFY_CHECKS = [
  "HAS_CONTEXT_FACTORY",
  "HAS_CONTEXT_GUARDS",
  "HAS_CONTEXT_SNAPSHOT",
  "CONSUMES_BRIDGE_ONLY",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_WORKFLOW_RUNTIME",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P2_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P2_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  contextVersion: WORKSPACE_QUOTE_CONTEXT_VERSION,
  phase: "v55-workspace-quote-p2",
  status: "quote-context-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  verifyChecks: V55_QUOTE_P2_VERIFY_CHECKS,
  nextHorizon: "Quote domain foundation (not started)",
  note: "V55 P2 workspace quote runtime context aggregates frozen P1 bridge only",
} as const;
