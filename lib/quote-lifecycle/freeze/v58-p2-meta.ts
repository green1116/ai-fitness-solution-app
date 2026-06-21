import {
  WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_VERSION,
} from "../shared/quote-lifecycle-constants";

export { WORKSPACE_QUOTE_LIFECYCLE_P2_TAG } from "../shared/quote-lifecycle-constants";

export const V58_QUOTE_P2_VERIFY_CHECKS = [
  "HAS_JOB_ENGINE",
  "HAS_JOB_DISPATCHER",
  "HAS_JOB_SCHEDULER",
  "HAS_JOB_REGISTRY",
  "HAS_JOB_COMMAND",
  "HAS_JOB_RESULT",
  "HAS_REDUCER",
  "HAS_VALIDATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER",
  "NO_QUEUE_SYSTEM",
  "NO_EVENT_BUS",
  "NO_UI_LOGIC",
  "NO_RUNTIME_IMPORT",
] as const;

export const WORKSPACE_QUOTE_LIFECYCLE_P2_META = {
  tag: WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
  version: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v58-quote-lifecycle-p2",
  status: "quote-job-engine-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_LIFECYCLE_P1_TAG,
  verifyChecks: V58_QUOTE_P2_VERIFY_CHECKS,
  nextHorizon: "Async client foundation (not started)",
  note: "V58 P2 defines quote job engine domain layer with dispatcher, scheduler, and in-memory registry",
} as const;
