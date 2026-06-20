import { WORKSPACE_QUOTE_RUNTIME_P7_TAG } from "../../validation/freeze/v55-p7-meta";
import { WORKSPACE_QUOTE_RUNTIME_VERSION } from "../../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P8_TAG = "v55-workspace-quote-p8" as const;

export const WORKSPACE_QUOTE_ALIGNMENT_VERSION = "v55-p8" as const;

export const V55_QUOTE_P8_VERIFY_CHECKS = [
  "HAS_WORKSPACE_ALIGNMENT",
  "HAS_WORKSPACE_SURFACE",
  "HAS_WORKSPACE_REGISTRY",
  "HAS_WORKSPACE_VALIDATION",
  "WORKSPACE_SURFACE_ALIGNED",
  "V55_FOUNDATION_INTEGRITY_LOCKED",
  "NO_WORKFLOW_RUNTIME",
  "NO_PERSISTENCE",
  "NO_API_HANDLER",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P8_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P8_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  alignmentVersion: WORKSPACE_QUOTE_ALIGNMENT_VERSION,
  phase: "v55-workspace-quote-p8",
  status: "quote-workspace-alignment-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P7_TAG,
  verifyChecks: V55_QUOTE_P8_VERIFY_CHECKS,
  nextHorizon: "Quote runtime final freeze (not started)",
  note: "V55 P8 aligns frozen P5 snapshot with V53 workspace runtime quote surface",
} as const;
