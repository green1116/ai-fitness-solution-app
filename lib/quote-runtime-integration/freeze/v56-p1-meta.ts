import {
  WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
  WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P1_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P1_VERIFY_CHECKS = [
  "HAS_EXECUTION_CORE",
  "HAS_V55_BRIDGE",
  "HAS_EXECUTOR_FACTORY",
  "HAS_EXECUTION_CONTEXT",
  "HAS_EXECUTION_RESULT",
  "PORT_ENFORCED_EXECUTION",
  "NO_DIRECT_DB_ACCESS",
  "NO_DIRECT_API_BYPASS",
  "V55_READ_ONLY_DEPENDENCY",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P1_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p1",
  status: "quote-execution-core-bootstrap",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_FINAL_DEPENDENCY_TAG,
  verifyChecks: V56_QUOTE_P1_VERIFY_CHECKS,
  nextHorizon: "Port binding layer (not started)",
  note: "V56 P1 bootstraps quote execution core on frozen V55 foundation via port-enforced flow",
} as const;
