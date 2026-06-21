import {
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  WORKSPACE_QUOTE_INTEGRATION_VERSION,
  SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
} from "../shared/integration-constants";

export { WORKSPACE_QUOTE_INTEGRATION_P3_TAG } from "../shared/integration-constants";

export const V56_QUOTE_P3_VERIFY_CHECKS = [
  "HAS_PERSISTENCE_ADAPTER",
  "HAS_REPOSITORY_BINDING",
  "PORT_ENFORCED_PERSISTENCE",
  "NO_DIRECT_DB_ACCESS",
  "NO_PRISMA_IMPORT_IN_EXECUTION",
] as const;

export const WORKSPACE_QUOTE_INTEGRATION_P3_META = {
  tag: WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  version: WORKSPACE_QUOTE_INTEGRATION_VERSION,
  phase: "v56-quote-runtime-p3",
  status: "quote-persistence-adapter",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  upstreamDependencyTag: SAAS_PRODUCT_PERSISTENCE_DEPENDENCY_TAG,
  verifyChecks: V56_QUOTE_P3_VERIFY_CHECKS,
  nextHorizon: "API adapter (not started)",
  note: "V56 P3 binds QuotePersistencePort to V50 repository through adapter layer only",
} as const;
