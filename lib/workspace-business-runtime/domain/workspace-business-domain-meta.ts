import { WORKSPACE_BUSINESS_RUNTIME_P2_TAG } from "../context/workspace-business-context-meta";
import { WORKSPACE_BUSINESS_RUNTIME_VERSION } from "../shared/business-constants";

export const WORKSPACE_BUSINESS_RUNTIME_P3_TAG = "v54-workspace-business-p3" as const;

export const WORKSPACE_BUSINESS_DOMAIN_VERSION = "v54-p3" as const;

export const V54_BUSINESS_P3_VERIFY_CHECKS = [
  "HAS_DOMAIN",
  "HAS_DOMAIN_STATE",
  "HAS_DOMAIN_FACTORY",
  "HAS_DOMAIN_RULES",
  "HAS_DOMAIN_VALIDATION",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_PORTAL",
  "NO_QUOTE",
  "NO_PROJECT",
  "NO_REPORT",
  "NO_ORCHESTRATION",
  "NO_ENTRY",
] as const;

export const WORKSPACE_BUSINESS_RUNTIME_P3_META = {
  tag: WORKSPACE_BUSINESS_RUNTIME_P3_TAG,
  version: WORKSPACE_BUSINESS_RUNTIME_VERSION,
  domainVersion: WORKSPACE_BUSINESS_DOMAIN_VERSION,
  phase: "v54-workspace-business-p3",
  status: "business-domain-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_BUSINESS_RUNTIME_P2_TAG,
  verifyChecks: V54_BUSINESS_P3_VERIFY_CHECKS,
  nextHorizon: "Business orchestration shell foundation (not started)",
  note: "V54 P3 workspace business domain aggregates frozen P2 context only",
} as const;
