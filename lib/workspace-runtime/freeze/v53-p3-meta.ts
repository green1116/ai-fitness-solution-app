import {
  WORKSPACE_RUNTIME_P2_TAG,
  WORKSPACE_RUNTIME_P3_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P3_VERIFY_CHECKS = [
  "RUNTIME_LIFECYCLE_EXISTS",
  "RUNTIME_LIFECYCLE_TYPES_EXISTS",
  "RUNTIME_LIFECYCLE_VALIDATION_EXISTS",
  "RUNTIME_LIFECYCLE_CONTEXT_EXISTS",
  "HAS_IDLE_STATUS",
  "HAS_READY_STATUS",
  "HAS_MOUNTED_STATUS",
  "HAS_REFRESHING_STATUS",
  "HAS_UNMOUNTED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P3_FREEZE = {
  tag: WORKSPACE_RUNTIME_P3_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-lifecycle-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P2_TAG,
  verifyChecks: V53_RUNTIME_P3_VERIFY_CHECKS,
  nextHorizon: "Runtime Capability Foundation (not started)",
  note: "V53 P3 workspace runtime lifecycle foundation on frozen P2 registry",
} as const;
