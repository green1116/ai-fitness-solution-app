import { WORKSPACE_BUSINESS_RUNTIME_P3_TAG } from "../domain/workspace-business-domain-meta";
import { WORKSPACE_BUSINESS_RUNTIME_VERSION } from "../shared/business-constants";

export const WORKSPACE_BUSINESS_RUNTIME_P4_TAG = "v54-workspace-business-p4" as const;

export const WORKSPACE_BUSINESS_ORCHESTRATION_VERSION = "v54-p4" as const;

export const V54_BUSINESS_P4_VERIFY_CHECKS = [
  "HAS_ORCHESTRATION",
  "HAS_ORCHESTRATION_STATE",
  "HAS_ORCHESTRATION_FACTORY",
  "HAS_ORCHESTRATION_RULES",
  "HAS_ORCHESTRATION_VALIDATION",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_PORTAL",
  "NO_WORKFLOW_RUNTIME",
  "NO_QUOTE",
  "NO_PROJECT",
  "NO_REPORT",
  "NO_ENTRY",
  "NO_EXECUTION",
] as const;

export const WORKSPACE_BUSINESS_RUNTIME_P4_META = {
  tag: WORKSPACE_BUSINESS_RUNTIME_P4_TAG,
  version: WORKSPACE_BUSINESS_RUNTIME_VERSION,
  orchestrationVersion: WORKSPACE_BUSINESS_ORCHESTRATION_VERSION,
  phase: "v54-workspace-business-p4",
  status: "business-orchestration-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_BUSINESS_RUNTIME_P3_TAG,
  verifyChecks: V54_BUSINESS_P4_VERIFY_CHECKS,
  nextHorizon: "Business entry shell foundation (not started)",
  note: "V54 P4 workspace business orchestration aggregates frozen P3 domain only",
} as const;
