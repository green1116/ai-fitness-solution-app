/**
 * V3.5 Commercialization Freeze Phase — 商业化冻结总入口
 */

export {
  COMMERCIALIZATION_VERSION,
  COMMERCIALIZATION_PHASE,
  COMMERCIALIZATION_FREEZE_ID,
  COMMERCIALIZATION_RUNTIME_TARGET,
  buildCommercializationSummary,
} from "./manifest";

export {
  DEFAULT_COMMERCIALIZATION_FREEZE_POLICY,
  isRuntimeExpansionAllowed,
  isCivilizationLayerAllowed,
  type CommercializationFreezePolicy,
} from "./policy";

export {
  validateCommercializationFreeze,
  assertFreezeCompliance,
  type CommercializationFreezeValidation,
} from "./guard";

export {
  runCommercializationFreezeLayer,
  formatCommercializationFreezeHook,
  type CommercializationFreezeInput,
  type CommercializationFreezeResult,
} from "./runtime";

export { buildPackagingSummary, type CommercialPackagingTier } from "./packaging";
export { buildTenantIsolationSummary, type TenantIsolationMode } from "./saas";
export { estimateRuntimeCost, type RuntimeCostProfile } from "./cost";

export {
  runStandardizationFoundation,
  buildStandardizationSummary,
  formatStandardizationRuntimeHook,
  STANDARDIZATION_FOUNDATION_VERSION,
} from "./standardization";

export {
  runComplianceFoundation,
  buildComplianceSummary,
  formatComplianceRuntimeHook,
  COMPLIANCE_FOUNDATION_VERSION,
} from "./compliance";

export {
  runRuntimeCostFoundation,
  buildCostSummary,
  formatCostRuntimeHook,
  RUNTIME_COST_FOUNDATION_VERSION,
} from "./runtime-cost";

export {
  runCommercialGovernanceFoundation,
  formatCommercialGovernanceHook,
  COMMERCIAL_GOVERNANCE_FOUNDATION_VERSION,
  type CommercialGovernanceFoundationResult,
} from "./governance";

export {
  applyContractFreezeBundle,
  CONTRACT_FREEZE_BUNDLE,
  buildContractFreezeSummary,
} from "./contracts/contract-freeze";

export {
  COMMERCIAL_RUNTIME_CHECKPOINTS,
  applyVersionLock,
  canUpgrade,
} from "./versioning";
export {
  buildReliabilitySummary,
  runReliabilityFoundation,
  formatReliabilityRuntimeHook,
  RELIABILITY_FOUNDATION_VERSION,
  resetCircuitBreaker,
  type ReliabilityFoundationInput,
  type ReliabilityFoundationResult,
  type RuntimeReliabilityProfile,
} from "./reliability";
export {
  buildObservabilitySummary,
  runObservabilityFoundation,
  formatObservabilityRuntimeHook,
  OBSERVABILITY_FOUNDATION_VERSION,
  buildObservabilityProfile,
  type RuntimeObservabilityProfile,
  type ObservabilityFoundationInput,
  type ObservabilityFoundationResult,
} from "./observability";

export {
  runMonitoringFoundation,
  buildMonitoringSummary,
  MONITORING_RUNTIME_VERSION,
  type MonitoringFoundationResult,
} from "./monitoring";

export {
  runTelemetryFoundation,
  buildTelemetrySummary,
  TELEMETRY_RUNTIME_VERSION,
  type TelemetryFoundationResult,
} from "./telemetry";

export * from "./freeze";
export * from "./deployment";
export * from "./monitoring";
export * from "./telemetry";
export * from "./standardization";
export * from "./runtime-cost";
export * from "./tenant-isolation";
export * from "./contracts";
export * from "./versioning";
export * from "./compliance";
export * from "./governance";
export * from "./packaging/index";
export * from "./gateway";
export * from "./finalization";
export * from "./public";
export * from "./http";
export * from "./openapi";
export * from "./sdk";
export * from "./integration";
export * from "./client";
export * from "./release";
export * from "./discovery";
export * from "./support";
export * from "./trust";
export * from "./transparency";
export * from "./closure";
export * from "./product";
export * from "./commerce";
export * from "./operations";
export * from "./portal";
export * from "./final";
export * from "./v37";
export * from "./launch";
export {
  formatLongTermSupportReadyHook,
  formatOperatingStateReadyHook,
  formatOperatingSurfaceReadyHook,
  formatRenewalReadyHook,
  runCommercialV37OperatingFoundation,
} from "./operations-v37";
export * from "./sunset";
export * from "./archive";
export * from "./legacy";
export * from "./atlas";
export * from "./hub";
export * from "./stabilization";

/** @deprecated */
export { runRuntimeFreezeLayer, formatRuntimeFreezeSummary } from "./runtime";
export {
  checkRuntimeExpansionGuard,
  assertRuntimeExpansionAllowed,
} from "./guard";
