import {
  WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P7_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P7_VERIFY_CHECKS = [
  "HAS_E2E_FLOW",
  "HAS_E2E_CONTEXT",
  "HAS_E2E_RESULT",
  "E2E_CHAIN_COMPLETE",
  "WORKFLOW_HAS_RELIABILITY",
  "NO_QUEUE",
  "NO_WORKER",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P7_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p7",
  status: "end-to-end-execution-flow",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  verifyChecks: V56_QUOTE_P7_VERIFY_CHECKS,
  nextHorizon: "Full integration verification (not started)",
  note: "V56 P7 validates the full quote runtime chain from workspace through P1-P6",
} as const;
