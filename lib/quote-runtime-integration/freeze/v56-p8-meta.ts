import {
  WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P8_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P8_TAG } from "../shared/integration-constants";

export const V56_INTEGRATION_LOCKED = "V56_INTEGRATION_LOCKED" as const;

export const V56_QUOTE_P8_VERIFY_CHECKS = [
  "HAS_EXECUTION_CORE",
  "HAS_PORT_BINDING",
  "HAS_PERSISTENCE_ADAPTER",
  "HAS_API_ADAPTER",
  "HAS_WORKFLOW_LAYER",
  "HAS_RELIABILITY_LAYER",
  "HAS_E2E_FLOW",
  "V56_INTEGRATION_LOCKED",
  "NO_DIRECT_PRISMA_ACCESS",
  "NO_DIRECT_HANDLER_ACCESS",
  "NO_QUEUE",
  "NO_WORKER",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P8_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P8_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p8",
  status: "full-integration-verification",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
  verifyChecks: V56_QUOTE_P8_VERIFY_CHECKS,
  integrityLocked: V56_INTEGRATION_LOCKED,
  nextHorizon: "V56 final freeze (not started)",
  note: "V56 P8 locks integration integrity across execution, ports, adapters, workflow, reliability, and e2e",
} as const;
