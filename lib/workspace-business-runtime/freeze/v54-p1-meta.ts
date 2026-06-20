import {
  V53_RUNTIME_FINAL_DEPENDENCY_TAG,
  WORKSPACE_BUSINESS_RUNTIME_P1_TAG,
  WORKSPACE_BUSINESS_RUNTIME_VERSION,
} from "../shared/business-constants";

export const V54_BUSINESS_P1_VERIFY_CHECKS = [
  "BRIDGE_EXISTS",
  "CONSUMES_ASSEMBLY_ONLY",
  "NO_KERNEL_MUTATION",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_API",
] as const;

export const WORKSPACE_BUSINESS_RUNTIME_P1_FREEZE = {
  tag: WORKSPACE_BUSINESS_RUNTIME_P1_TAG,
  version: WORKSPACE_BUSINESS_RUNTIME_VERSION,
  status: "business-bridge-foundation",
  frozen: false,
  dependencyTag: V53_RUNTIME_FINAL_DEPENDENCY_TAG,
  verifyChecks: V54_BUSINESS_P1_VERIFY_CHECKS,
  nextHorizon: "Business Context Foundation (not started)",
  note: "V54 P1 workspace business runtime bridge on frozen V53 assembly context",
} as const;
