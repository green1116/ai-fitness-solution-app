import {
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
  SAAS_PRODUCT_API_DEPENDENCY_TAG,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P4_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P4_VERIFY_CHECKS = [
  "HAS_API_ADAPTER",
  "HAS_API_BINDING",
  "PORT_ENFORCED_API",
  "NO_DIRECT_API_HANDLER",
  "NO_DIRECT_ROUTE_ACCESS",
  "NO_WORKFLOW_EXECUTION",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P4_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p4",
  status: "quote-api-adapter",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  upstreamDependencyTag: SAAS_PRODUCT_API_DEPENDENCY_TAG,
  verifyChecks: V56_QUOTE_P4_VERIFY_CHECKS,
  nextHorizon: "Workflow orchestration (not started)",
  note: "V56 P4 binds QuoteApiExposurePort to V51 API exposure metadata without handler coupling",
} as const;
