/**
 * Product KPI — KPI Management public exports
 * Isolated namespace: lib/product/kpi
 */

export {
  KPI_CATEGORIES,
  KPI_MANAGER_STATUSES,
  KPI_READINESS_VERDICTS,
  KPI_STATUSES,
  MEASUREMENT_RESULTS,
  PRODUCT_KPI_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
  TARGET_PERIODS,
} from "./management/management.constants";

export type {
  KpiManagerStatus,
  KpiReadinessCheck,
  KpiReadinessResult,
  KpiReadinessVerdict,
  KpiRegistryManifest,
} from "./management/management.types";

export type {
  DefineKpiInput,
  DefinitionMetadata,
  KpiCategory,
  KpiDefinition,
  KpiStatus,
  UpdateKpiStatusInput,
} from "./definition/definition.types";

export {
  clearKpiDefinitions,
  defineKpi,
  getKpiDefinition,
  listKpiDefinitions,
  updateKpiStatus,
} from "./definition/definition.registry";

export type {
  KpiTarget,
  SetKpiTargetInput,
  TargetMetadata,
  TargetPeriod,
} from "./target/target.types";

export {
  clearKpiTargets,
  getKpiTarget,
  listKpiTargets,
  setKpiTarget,
} from "./target/target.registry";

export type {
  KpiMeasurement,
  MeasurementMetadata,
  MeasurementResult,
  RecordKpiMeasurementInput,
} from "./measurement/measurement.types";

export {
  clearKpiMeasurements,
  getKpiMeasurement,
  listKpiMeasurements,
  recordKpiMeasurement,
} from "./measurement/measurement.registry";

export type {
  BuildScorecardInput,
  KpiScorecard,
  ScorecardMetadata,
} from "./scorecard/scorecard.types";

export {
  buildScorecard,
  clearScorecards,
  getScorecard,
  listScorecards,
} from "./scorecard/scorecard.registry";

export {
  assertKpiManagementReadinessReady,
  evaluateKpiManagementReadiness,
} from "./management/management.readiness";

export {
  clearKpiManagementLayer,
  createKpiManager,
  getKpiRegistryManifest,
  type KpiManager,
  type KpiManagerSnapshot,
} from "./kpi.manager";

export {
  assertProductKpiReleaseGatePass,
  checkProductKpiReleaseGate,
  PRODUCT_KPI_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
