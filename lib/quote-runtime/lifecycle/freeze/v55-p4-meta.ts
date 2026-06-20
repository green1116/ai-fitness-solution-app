import { WORKSPACE_QUOTE_RUNTIME_P3_TAG } from "../../domain/freeze/v55-p3-meta";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P4_TAG = "v55-workspace-quote-p4" as const;

export const WORKSPACE_QUOTE_LIFECYCLE_VERSION = "v55-p4" as const;

export const V55_QUOTE_P4_VERIFY_CHECKS = [
  "HAS_LIFECYCLE_TYPES",
  "HAS_LIFECYCLE_STATE",
  "HAS_LIFECYCLE_GUARDS",
  "HAS_LIFECYCLE_REGISTRY",
  "HAS_LIFECYCLE_FACTORY",
  "HAS_LIFECYCLE_VIEW",
  "CONSUMES_DOMAIN_VIEW_ONLY",
  "NO_WORKFLOW_RUNTIME",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P4_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P4_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  lifecycleVersion: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v55-workspace-quote-p4",
  status: "quote-lifecycle-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P3_TAG,
  verifyChecks: V55_QUOTE_P4_VERIFY_CHECKS,
  nextHorizon: "Quote assembly foundation (not started)",
  note: "V55 P4 workspace quote lifecycle aggregates frozen P3 domain view only",
} as const;
