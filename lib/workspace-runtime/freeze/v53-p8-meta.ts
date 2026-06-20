import {
  WORKSPACE_RUNTIME_P7_TAG,
  WORKSPACE_RUNTIME_P8_TAG,
  WORKSPACE_RUNTIME_VERSION,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P8_VERIFY_CHECKS = [
  "RUNTIME_WORKSPACE_ASSEMBLY_EXISTS",
  "RUNTIME_WORKSPACE_ASSEMBLY_TYPES_EXISTS",
  "RUNTIME_WORKSPACE_ASSEMBLY_VALIDATION_EXISTS",
  "RUNTIME_WORKSPACE_ASSEMBLY_CONTEXT_EXISTS",
  "HAS_ASSEMBLED_STATUS",
  "HAS_PARTIAL_STATUS",
  "HAS_DEGRADED_STATUS",
  "HAS_INACTIVE_STATUS",
  "HAS_RESERVED_STATUS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P8_FREEZE = {
  tag: WORKSPACE_RUNTIME_P8_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-workspace-assembly-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_RUNTIME_P7_TAG,
  verifyChecks: V53_RUNTIME_P8_VERIFY_CHECKS,
  nextHorizon: "V53 Workspace Runtime Freeze (recommended)",
  note: "V53 P8 workspace runtime assembly foundation on frozen P7 surface",
} as const;
