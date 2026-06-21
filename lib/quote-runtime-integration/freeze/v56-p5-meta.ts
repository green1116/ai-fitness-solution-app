import {
  WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P5_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P5_VERIFY_CHECKS = [
  "HAS_WORKFLOW_ORCHESTRATOR",
  "HAS_WORKFLOW_CONTEXT",
  "HAS_WORKFLOW_STATE",
  "WORKFLOW_USES_PORTS_ONLY",
  "NO_PRISMA_IMPORT",
  "NO_DIRECT_HANDLER_ACCESS",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P5_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p5",
  status: "quote-workflow-orchestration",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  verifyChecks: V56_QUOTE_P5_VERIFY_CHECKS,
  nextHorizon: "Error handling / retry / logs (not started)",
  note: "V56 P5 orchestrates persistence and API adapters through ports only",
} as const;
