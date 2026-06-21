import {
  WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_VERSION,
} from "../shared/quote-lifecycle-constants";

export { WORKSPACE_QUOTE_LIFECYCLE_P4_TAG } from "../shared/quote-lifecycle-constants";

export const V58_QUOTE_P4_VERIFY_CHECKS = [
  "HAS_EVENT_CONTRACT",
  "HAS_EVENT_ENVELOPE",
  "HAS_EVENT_TYPES",
  "HAS_EVENT_MAPPER",
  "HAS_EVENT_VALIDATION",
  "HAS_LIFECYCLE_EVENT",
  "HAS_JOB_EVENT",
  "HAS_EXECUTION_EVENT",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER",
  "NO_QUEUE",
  "NO_EVENT_BUS_IMPL",
  "NO_UI_LOGIC",
  "NO_V57_MODIFICATION",
  "NO_V56_INTERNAL_IMPORT",
] as const;

export const WORKSPACE_QUOTE_LIFECYCLE_P4_META = {
  tag: WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
  version: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v58-quote-lifecycle-p4",
  status: "quote-event-contract-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
  verifyChecks: V58_QUOTE_P4_VERIFY_CHECKS,
  nextHorizon: "Status sync foundation (not started)",
  note: "V58 P4 defines unified quote async event contract for lifecycle, job, and execution layers",
} as const;
