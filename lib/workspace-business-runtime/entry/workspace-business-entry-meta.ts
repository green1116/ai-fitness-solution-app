import { WORKSPACE_BUSINESS_RUNTIME_P4_TAG } from "../orchestration/workspace-business-orchestration-meta";
import { WORKSPACE_BUSINESS_RUNTIME_VERSION } from "../shared/business-constants";

export const WORKSPACE_BUSINESS_RUNTIME_P5_TAG = "v54-workspace-business-p5" as const;

export const WORKSPACE_BUSINESS_ENTRY_VERSION = "v54-p5" as const;

export const V54_BUSINESS_P5_VERIFY_CHECKS = [
  "HAS_ENTRY",
  "HAS_ENTRY_STATE",
  "HAS_ENTRY_FACTORY",
  "HAS_ENTRY_REGISTRY",
  "HAS_ENTRY_VALIDATION",
  "NO_PRISMA",
  "NO_PERSISTENCE",
  "NO_API",
  "NO_PORTAL",
  "NO_WORKFLOW_RUNTIME",
  "NO_EXECUTION",
  "NO_QUOTE",
  "NO_PROJECT",
  "NO_REPORT",
] as const;

export const WORKSPACE_BUSINESS_RUNTIME_P5_META = {
  tag: WORKSPACE_BUSINESS_RUNTIME_P5_TAG,
  version: WORKSPACE_BUSINESS_RUNTIME_VERSION,
  entryVersion: WORKSPACE_BUSINESS_ENTRY_VERSION,
  phase: "v54-workspace-business-p5",
  status: "business-entry-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_BUSINESS_RUNTIME_P4_TAG,
  verifyChecks: V54_BUSINESS_P5_VERIFY_CHECKS,
  nextHorizon: "Business runtime assembly foundation (not started)",
  note: "V54 P5 workspace business entry aggregates frozen P4 orchestration only",
} as const;
