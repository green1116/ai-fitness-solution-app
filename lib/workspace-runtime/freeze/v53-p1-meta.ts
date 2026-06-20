import {
  WORKSPACE_RUNTIME_P1_TAG,
  WORKSPACE_RUNTIME_VERSION,
  V52_PORTAL_UI_FINAL_DEPENDENCY_TAG,
} from "../shared/runtime-constants";

export const V53_RUNTIME_P1_VERIFY_CHECKS = [
  "RUNTIME_TYPES_EXISTS",
  "RUNTIME_CONTRACTS_EXISTS",
  "RUNTIME_CONTEXT_EXISTS",
  "RUNTIME_VALIDATION_EXISTS",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_BUSINESS_LOGIC",
] as const;

export const WORKSPACE_RUNTIME_P1_FREEZE = {
  tag: WORKSPACE_RUNTIME_P1_TAG,
  version: WORKSPACE_RUNTIME_VERSION,
  status: "runtime-contracts-foundation",
  frozen: false,
  dependencyTag: V52_PORTAL_UI_FINAL_DEPENDENCY_TAG,
  verifyChecks: V53_RUNTIME_P1_VERIFY_CHECKS,
  nextHorizon: "Runtime Registry Foundation (not started)",
  note: "V53 P1 workspace runtime contracts foundation on frozen V52 portal UI final",
} as const;
