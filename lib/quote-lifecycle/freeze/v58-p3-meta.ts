import {
  WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
  WORKSPACE_QUOTE_LIFECYCLE_VERSION,
} from "../shared/quote-lifecycle-constants";

export { WORKSPACE_QUOTE_LIFECYCLE_P3_TAG } from "../shared/quote-lifecycle-constants";

export const V58_QUOTE_P3_VERIFY_CHECKS = [
  "HAS_ASYNC_CLIENT",
  "HAS_ASYNC_ADAPTER",
  "HAS_ASYNC_GATEWAY",
  "HAS_ASYNC_MAPPER",
  "HAS_RUNTIME_BRIDGE",
  "HAS_STUB_IMPLEMENTATION",
  "NO_PRISMA_ACCESS",
  "NO_REPOSITORY_ACCESS",
  "NO_WORKER",
  "NO_QUEUE",
  "NO_EVENT_BUS",
  "NO_UI_LOGIC",
  "NO_V57_MODIFICATION",
  "NO_V56_INTERNAL_IMPORT",
] as const;

export const WORKSPACE_QUOTE_LIFECYCLE_P3_META = {
  tag: WORKSPACE_QUOTE_LIFECYCLE_P3_TAG,
  version: WORKSPACE_QUOTE_LIFECYCLE_VERSION,
  phase: "v58-quote-lifecycle-p3",
  status: "quote-async-runtime-client-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_LIFECYCLE_P2_TAG,
  verifyChecks: V58_QUOTE_P3_VERIFY_CHECKS,
  nextHorizon: "Event bus foundation (not started)",
  note: "V58 P3 defines async runtime client adapter layer between job engine and runtime bridge",
} as const;
