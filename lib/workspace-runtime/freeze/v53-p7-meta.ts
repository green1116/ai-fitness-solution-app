import {
  WORKSPACE_RUNTIME_P6_TAG,
  WORKSPACE_RUNTIME_P7_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P7_VERIFY_CHECKS = [
  "RUNTIME_SURFACE_EXISTS",
  "RUNTIME_SURFACE_TYPES_EXISTS",
  "RUNTIME_SURFACE_VALIDATION_EXISTS",
  "RUNTIME_SURFACE_CONTEXT_EXISTS",
  "HAS_WORKSPACE_SURFACE",
  "HAS_QUOTE_SURFACE",
  "HAS_PROJECT_SURFACE",
  "HAS_REPORT_SURFACE",
  "HAS_VISIBLE_STATUS",
  "HAS_HIDDEN_STATUS",
  "HAS_ACTIVE_STATUS",
  "HAS_INACTIVE_STATUS",
  "HAS_RESERVED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P7_FREEZE = {
  tag: WORKSPACE_RUNTIME_P7_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-surface-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P6_TAG,
  verifyChecks: V53_RUNTIME_P7_VERIFY_CHECKS,
  nextHorizon: "Runtime Workspace Assembly (not started)",
  note: "V53 P7 workspace runtime surface foundation on frozen P6 entry",
} as const;
