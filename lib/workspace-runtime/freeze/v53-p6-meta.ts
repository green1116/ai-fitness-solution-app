import {
  WORKSPACE_RUNTIME_P5_TAG,
  WORKSPACE_RUNTIME_P6_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P6_VERIFY_CHECKS = [
  "RUNTIME_ENTRY_EXISTS",
  "RUNTIME_ENTRY_TYPES_EXISTS",
  "RUNTIME_ENTRY_VALIDATION_EXISTS",
  "RUNTIME_ENTRY_CONTEXT_EXISTS",
  "HAS_WORKSPACE_ENTRY",
  "HAS_QUOTE_ENTRY",
  "HAS_PROJECT_ENTRY",
  "HAS_REPORT_ENTRY",
  "HAS_ACTIVE_STATUS",
  "HAS_INACTIVE_STATUS",
  "HAS_HIDDEN_STATUS",
  "HAS_RESERVED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P6_FREEZE = {
  tag: WORKSPACE_RUNTIME_P6_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-entry-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P5_TAG,
  verifyChecks: V53_RUNTIME_P6_VERIFY_CHECKS,
  nextHorizon: "Runtime Surface Foundation (not started)",
  note: "V53 P6 workspace runtime entry foundation on frozen P5 verification",
} as const;
