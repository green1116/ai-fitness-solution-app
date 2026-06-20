import {
  WORKSPACE_RUNTIME_P1_TAG,
  WORKSPACE_RUNTIME_P2_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P2_VERIFY_CHECKS = [
  "RUNTIME_REGISTRY_EXISTS",
  "RUNTIME_REGISTRY_TYPES_EXISTS",
  "RUNTIME_REGISTRY_VALIDATION_EXISTS",
  "RUNTIME_REGISTRY_CONTEXT_EXISTS",
  "REGISTRY_HAS_WORKSPACE_RUNTIME",
  "REGISTRY_HAS_QUOTE_RUNTIME",
  "REGISTRY_HAS_PROJECT_RUNTIME",
  "REGISTRY_HAS_REPORT_RUNTIME",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P2_FREEZE = {
  tag: WORKSPACE_RUNTIME_P2_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-registry-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P1_TAG,
  verifyChecks: V53_RUNTIME_P2_VERIFY_CHECKS,
  nextHorizon: "Runtime Lifecycle Foundation (not started)",
  note: "V53 P2 workspace runtime registry foundation on frozen P1 contracts",
} as const;
