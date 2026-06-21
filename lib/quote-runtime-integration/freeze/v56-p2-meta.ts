import {
  WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P2_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P2_VERIFY_CHECKS = [
  "HAS_PORT_RESOLVER",
  "HAS_PORT_REGISTRY_WIRING",
  "HAS_PORT_BINDING_CONTEXT",
  "HAS_EXECUTION_PORT_MAPPING",
  "NO_DIRECT_DB_ACCESS",
  "NO_DIRECT_API_ACCESS",
  "NO_WORKFLOW_EXECUTION",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P2_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p2",
  status: "quote-port-binding-layer",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  verifyChecks: V56_QUOTE_P2_VERIFY_CHECKS,
  nextHorizon: "Persistence adapter (not started)",
  note: "V56 P2 wires V55 port interfaces into execution via stub binding without IO",
} as const;
