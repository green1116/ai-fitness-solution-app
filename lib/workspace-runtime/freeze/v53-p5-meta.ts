import {
  WORKSPACE_RUNTIME_P4_TAG,
  WORKSPACE_RUNTIME_P5_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P5_VERIFY_CHECKS = [
  "RUNTIME_VERIFICATION_EXISTS",
  "RUNTIME_VERIFICATION_TYPES_EXISTS",
  "RUNTIME_VERIFICATION_VALIDATION_EXISTS",
  "RUNTIME_VERIFICATION_CONTEXT_EXISTS",
  "HAS_PASSED_STATUS",
  "HAS_WARNING_STATUS",
  "HAS_FAILED_STATUS",
  "HAS_SKIPPED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P5_FREEZE = {
  tag: WORKSPACE_RUNTIME_P5_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-verification-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P4_TAG,
  verifyChecks: V53_RUNTIME_P5_VERIFY_CHECKS,
  nextHorizon: "Runtime Entry Foundation (not started)",
  note: "V53 P5 workspace runtime verification foundation on frozen P4 capability",
} as const;
