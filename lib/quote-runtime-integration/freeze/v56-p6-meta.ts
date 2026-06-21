import {
  WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P6_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P6_VERIFY_CHECKS = [
  "HAS_ERROR_MODEL",
  "HAS_RETRY_POLICY",
  "HAS_EXECUTION_LOG",
  "HAS_AUDIT_TRAIL",
  "WORKFLOW_HAS_RELIABILITY",
  "NO_BACKGROUND_WORKER",
  "NO_QUEUE",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P6_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p6",
  status: "runtime-reliability-layer",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  verifyChecks: V56_QUOTE_P6_VERIFY_CHECKS,
  nextHorizon: "End-to-end execution flow (not started)",
  note: "V56 P6 adds error model, retry policy, execution logs, and audit trail to workflow orchestration",
} as const;
