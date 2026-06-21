export * from "./shared/integration-constants";
export * from "./shared/integration-types";
export * from "./ports/quote-runtime.port";
export * from "./ports/quote-persistence.adapter.port";
export * from "./ports/quote-api.adapter.port";
export * from "./bridge/quote-runtime-bridge";
export * from "./services/quote-execution.service";
export * from "./services/quote-runtime-orchestrator";
export * from "./integration/quote-runtime-integration";
export * from "./integration/create-quote-runtime-executor";
export {
  validateQuoteIntegrationP1,
  assertHasExecutionCore,
  assertExecutionCoreContract,
  assertV55BridgeContract,
  assertExecutorFactoryContract,
  assertExecutionContextContract,
  assertExecutionResultContract,
  assertPortEnforcedExecutionContract,
  assertNoDirectDbAccess,
  assertNoDirectApiBypass,
  assertV55ReadOnlyDependency,
  assertMountedQuoteExecutionCore,
} from "./validation/quote-integration-verify-p1";
export type { QuoteIntegrationP1Validation } from "./validation/quote-integration-verify-p1";
export {
  WORKSPACE_QUOTE_INTEGRATION_P1_META,
  WORKSPACE_QUOTE_INTEGRATION_P1_TAG,
  V56_QUOTE_P1_VERIFY_CHECKS,
} from "./freeze/v56-p1-meta";
export * from "./ports/quote-port-resolver";
export * from "./ports/quote-port-registry";
export * from "./ports/quote-port-binding";
export * from "./services/quote-port-executor";
export * from "./integration/quote-runtime-port-binding";
export * from "./integration/create-quote-runtime-port-binding";
export {
  validateQuoteIntegrationP2,
  assertHasPortResolver,
  assertPortResolverContract,
  assertPortRegistryWiringContract,
  assertPortBindingContextContract,
  assertExecutionPortMappingContract,
  assertP2NoDirectDbAccess,
  assertP2NoDirectApiAccess,
  assertP2NoWorkflowExecution,
  assertP2NoPrismaImport,
  assertMountedQuotePortBinding,
} from "./validation/quote-port-binding.verify";
export type { QuoteIntegrationP2Validation } from "./validation/quote-port-binding.verify";
export {
  WORKSPACE_QUOTE_INTEGRATION_P2_META,
  WORKSPACE_QUOTE_INTEGRATION_P2_TAG,
  V56_QUOTE_P2_VERIFY_CHECKS,
} from "./freeze/v56-p2-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P2_FREEZE } from "./freeze/v56-p2-final";
export * from "./adapters/persistence";
export {
  validateQuoteIntegrationP3,
  assertHasPersistenceAdapter,
  assertPersistenceAdapterContract,
  assertRepositoryBindingContract,
  assertPortEnforcedPersistenceContract,
  assertP3NoDirectDbAccess,
  assertP3NoPrismaImportInExecution,
  assertAdapterUsesV50RepositoryNotPrisma,
  assertMountedQuotePersistenceAdapter,
} from "./validation/quote-persistence.verify";
export type { QuoteIntegrationP3Validation } from "./validation/quote-persistence.verify";
export {
  WORKSPACE_QUOTE_INTEGRATION_P3_META,
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
  V56_QUOTE_P3_VERIFY_CHECKS,
} from "./freeze/v56-p3-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P3_FREEZE } from "./freeze/v56-p3-final";
export * from "./adapters/api";
export {
  validateQuoteIntegrationP4,
  assertHasApiAdapter,
  assertApiAdapterContract,
  assertApiBindingContract,
  assertPortEnforcedApiContract,
  assertP4NoDirectApiHandler,
  assertP4NoDirectRouteAccess,
  assertP4NoWorkflowExecution,
  assertAdapterUsesV51ExposureNotHandlers,
  assertMountedQuoteApiAdapter,
} from "./validation/quote-api.verify";
export type { QuoteIntegrationP4Validation } from "./validation/quote-api.verify";
export {
  WORKSPACE_QUOTE_INTEGRATION_P4_META,
  WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
  V56_QUOTE_P4_VERIFY_CHECKS,
} from "./freeze/v56-p4-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P4_FREEZE } from "./freeze/v56-p4-final";
export * from "./workflow";
export {
  WORKSPACE_QUOTE_INTEGRATION_P5_META,
  WORKSPACE_QUOTE_INTEGRATION_P5_TAG,
  V56_QUOTE_P5_VERIFY_CHECKS,
} from "./freeze/v56-p5-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P5_FREEZE } from "./freeze/v56-p5-final";
export * from "./reliability";
export {
  WORKSPACE_QUOTE_INTEGRATION_P6_META,
  WORKSPACE_QUOTE_INTEGRATION_P6_TAG,
  V56_QUOTE_P6_VERIFY_CHECKS,
} from "./freeze/v56-p6-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P6_FREEZE } from "./freeze/v56-p6-final";
export * from "./e2e";
export {
  WORKSPACE_QUOTE_INTEGRATION_P7_META,
  WORKSPACE_QUOTE_INTEGRATION_P7_TAG,
  V56_QUOTE_P7_VERIFY_CHECKS,
} from "./freeze/v56-p7-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P7_FREEZE } from "./freeze/v56-p7-final";
export * from "./verification";
export {
  WORKSPACE_QUOTE_INTEGRATION_P8_META,
  WORKSPACE_QUOTE_INTEGRATION_P8_TAG,
  V56_QUOTE_P8_VERIFY_CHECKS,
} from "./freeze/v56-p8-meta";
export { WORKSPACE_QUOTE_INTEGRATION_P8_FREEZE } from "./freeze/v56-p8-final";
export {
  V56_INTEGRATION_FROZEN,
  V56_QUOTE_INTEGRATION_FINAL_VERIFY_CHECKS,
  V56_QUOTE_INTEGRATION_LAYER_STACK,
  V56_QUOTE_INTEGRATION_PHASE_TAGS,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_META,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_TAG,
  WORKSPACE_QUOTE_INTEGRATION_FINAL_VERSION,
} from "./freeze/v56-final-meta";
export {
  V56_QUOTE_INTEGRATION_FINAL_FREEZE,
  V56_QUOTE_INTEGRATION_DEPENDENCY_CHAIN,
  V56_QUOTE_INTEGRATION_LAYER_BOUNDARIES,
} from "./freeze/v56-final";
export {
  assertV56IntegrationFrozen,
  validateQuoteIntegrationFinal,
} from "./verification/quote-integration-final.verify";
export type { QuoteIntegrationFinalValidation } from "./verification/quote-integration-final.verify";
