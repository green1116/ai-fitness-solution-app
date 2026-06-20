import { WORKSPACE_QUOTE_RUNTIME_P2_TAG } from "../../freeze/v55-p2-meta";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P3_TAG = "v55-workspace-quote-p3" as const;

export const WORKSPACE_QUOTE_DOMAIN_VERSION = "v55-p3" as const;

export const V55_QUOTE_P3_VERIFY_CHECKS = [
  "HAS_DOMAIN_TYPES",
  "HAS_DOMAIN_STATE",
  "HAS_DOMAIN_GUARDS",
  "HAS_DOMAIN_REGISTRY",
  "HAS_DOMAIN_FACTORY",
  "HAS_DOMAIN_VIEW",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_WORKFLOW_RUNTIME",
  "NO_PRISMA_IMPORT",
  "CONSUMES_CONTEXT_SNAPSHOT_ONLY",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P3_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P3_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  domainVersion: WORKSPACE_QUOTE_DOMAIN_VERSION,
  phase: "v55-workspace-quote-p3",
  status: "quote-domain-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P2_TAG,
  verifyChecks: V55_QUOTE_P3_VERIFY_CHECKS,
  nextHorizon: "Quote lifecycle foundation (not started)",
  note: "V55 P3 workspace quote domain aggregates frozen P2 context snapshot only",
} as const;
