import { WORKSPACE_QUOTE_RUNTIME_P4_TAG } from "../../lifecycle/freeze/v55-p4-meta";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P5_TAG = "v55-workspace-quote-p5" as const;

export const WORKSPACE_QUOTE_ASSEMBLY_VERSION = "v55-p5" as const;

export const V55_QUOTE_P5_VERIFY_CHECKS = [
  "HAS_ASSEMBLY_TYPES",
  "HAS_ASSEMBLY_VIEW",
  "HAS_ASSEMBLY_FACTORY",
  "HAS_ASSEMBLY_GUARDS",
  "HAS_ASSEMBLY_SNAPSHOT",
  "CONSUMES_LIFECYCLE_VIEW_ONLY",
  "NO_WORKFLOW_RUNTIME",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P5_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P5_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  assemblyVersion: WORKSPACE_QUOTE_ASSEMBLY_VERSION,
  phase: "v55-workspace-quote-p5",
  status: "quote-assembly-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P4_TAG,
  verifyChecks: V55_QUOTE_P5_VERIFY_CHECKS,
  nextHorizon: "Quote verification foundation (not started)",
  note: "V55 P5 workspace quote runtime assembly aggregates frozen P4 lifecycle view only",
} as const;
