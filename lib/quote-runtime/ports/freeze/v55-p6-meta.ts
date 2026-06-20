import { WORKSPACE_QUOTE_RUNTIME_P5_TAG } from "../../assembly/freeze/v55-p5-meta";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P6_TAG = "v55-workspace-quote-p6" as const;

export const WORKSPACE_QUOTE_PORT_VERSION = "v55-p6" as const;

export const V55_QUOTE_P6_VERIFY_CHECKS = [
  "HAS_PERSISTENCE_PORT",
  "HAS_API_PORT",
  "HAS_COMMERCIAL_PORT",
  "HAS_PORT_REGISTRY",
  "HAS_PORT_GUARDS",
  "HAS_PORT_TYPES",
  "CONSUMES_ASSEMBLY_SNAPSHOT_ONLY",
  "NO_IMPLEMENTATION_LOGIC",
  "NO_PRISMA_IMPORT",
  "NO_API_HANDLER",
  "NO_WORKFLOW_RUNTIME",
  "NO_PERSISTENCE_ACCESS",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P6_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P6_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  portVersion: WORKSPACE_QUOTE_PORT_VERSION,
  phase: "v55-workspace-quote-p6",
  status: "quote-port-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P5_TAG,
  verifyChecks: V55_QUOTE_P6_VERIFY_CHECKS,
  nextHorizon: "Quote verification foundation (not started)",
  note: "V55 P6 workspace quote runtime ports declare frozen P5 assembly snapshot contracts only",
} as const;
