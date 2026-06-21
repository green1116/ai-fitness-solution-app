import {
  WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_P5_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_VERSION,
} from "../shared/quote-lifecycle-constants";

export { WORKSPACE_QUOTE_LIFECYCLE_P5_TAG } from "../shared/quote-lifecycle-constants";

export const V58_QUOTE_P5_VERIFY_CHECKS = [
  "HAS_STATUS_SNAPSHOT",
  "HAS_STATUS_REDUCER",
  "HAS_STATUS_PROJECTOR",
  "HAS_STATUS_SELECTOR",
  "HAS_STATUS_MAPPER",
  "HAS_STATUS_BUILDER",
  "HAS_STATUS_VALIDATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER",
  "NO_QUEUE",
  "NO_EVENT_BUS_IMPL",
  "NO_UI_LOGIC",
  "NO_RUNTIME_LOGIC",
  "NO_V57_MODIFICATION",
] as const;

export const WORKSPACE_QUOTE_LIFECYCLE_P5_META = {
  tag: WORKSPACE_QUOTE_LIFECYCLE_P5_TAG,
  version: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v58-quote-lifecycle-p5",
  status: "quote-status-sync-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_LIFECYCLE_P4_TAG,
  verifyChecks: V58_QUOTE_P5_VERIFY_CHECKS,
  nextHorizon: "History foundation (not started)",
  note: "V58 P5 projects quote event contract into unified in-memory status read model snapshots",
} as const;
