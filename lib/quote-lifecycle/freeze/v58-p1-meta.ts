import {
  WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  WORKSPACE_QUOTE_PRODUCT_FINAL_DEPENDENCY_TAG,
} from "../shared/quote-lifecycle-constants";

export { WORKSPACE_QUOTE_LIFECYCLE_P1_TAG } from "../shared/quote-lifecycle-constants";

export const V58_QUOTE_P1_VERIFY_CHECKS = [
  "HAS_LIFECYCLE_TYPES",
  "HAS_LIFECYCLE_STATE",
  "HAS_LIFECYCLE_REDUCER",
  "HAS_LIFECYCLE_TRANSITION",
  "HAS_JOB_TYPES",
  "HAS_EXECUTION_TYPES",
  "HAS_VALIDATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER_IMPL",
  "NO_EVENT_BUS_IMPL",
  "NO_UI_LOGIC",
] as const;

export const WORKSPACE_QUOTE_LIFECYCLE_P1_META = {
  tag: WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
  version: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v58-quote-lifecycle-p1",
  status: "quote-lifecycle-model-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_PRODUCT_FINAL_DEPENDENCY_TAG,
  verifyChecks: V58_QUOTE_P1_VERIFY_CHECKS,
  nextHorizon: "Job engine foundation (not started)",
  note: "V58 P1 defines quote lifecycle, job, and execution async state models with transition rules",
} as const;
