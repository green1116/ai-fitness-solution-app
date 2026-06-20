import {
  WORKSPACE_RUNTIME_P3_TAG,
  WORKSPACE_RUNTIME_P4_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P4_VERIFY_CHECKS = [
  "RUNTIME_CAPABILITY_EXISTS",
  "RUNTIME_CAPABILITY_TYPES_EXISTS",
  "RUNTIME_CAPABILITY_VALIDATION_EXISTS",
  "RUNTIME_CAPABILITY_CONTEXT_EXISTS",
  "HAS_WORKSPACE_CAPABILITY",
  "HAS_QUOTE_CAPABILITY",
  "HAS_PROJECT_CAPABILITY",
  "HAS_REPORT_CAPABILITY",
  "HAS_ENABLED_STATUS",
  "HAS_DISABLED_STATUS",
  "HAS_EXPERIMENTAL_STATUS",
  "HAS_DEPRECATED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P4_FREEZE = {
  tag: WORKSPACE_RUNTIME_P4_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-capability-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P3_TAG,
  verifyChecks: V53_RUNTIME_P4_VERIFY_CHECKS,
  nextHorizon: "Runtime Verification Foundation (not started)",
  note: "V53 P4 workspace runtime capability foundation on frozen P3 lifecycle",
} as const;
