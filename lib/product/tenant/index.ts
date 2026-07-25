/**
 * Product Tenant — Tenant Administration public exports
 * Isolated namespace: lib/product/tenant
 */

export {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
  PRODUCT_TENANT_FREEZE_VERSION,
  TENANT_ISOLATION_MODES,
  TENANT_LIFECYCLE_STATES,
  TENANT_MANAGER_STATUSES,
  TENANT_QUOTA_RESOURCES,
  TENANT_READINESS_VERDICTS,
  TENANT_RECORD_STATUSES,
  TENANT_TIERS,
} from "./administration/administration.constants";

export type {
  TenantManagerStatus,
  TenantReadinessCheck,
  TenantReadinessResult,
  TenantReadinessVerdict,
  TenantRegistryManifest,
} from "./administration/administration.types";

export type {
  RecordMetadata,
  RegisterTenantRecordInput,
  TenantRecord,
  TenantRecordStatus,
  TenantTier,
  UpdateTenantRecordStatusInput,
} from "./record/record.types";

export {
  clearTenantRecords,
  getTenantRecord,
  listTenantRecords,
  registerTenantRecord,
  updateTenantRecordStatus,
} from "./record/record.registry";

export type {
  QuotaMetadata,
  SetTenantQuotaInput,
  TenantQuota,
  TenantQuotaResource,
} from "./quota/quota.types";

export {
  clearTenantQuotas,
  getTenantQuota,
  listTenantQuotas,
  setTenantQuota,
} from "./quota/quota.registry";

export type {
  ConfigureTenantIsolationInput,
  IsolationMetadata,
  TenantIsolation,
  TenantIsolationMode,
} from "./isolation/isolation.types";

export {
  clearTenantIsolations,
  configureTenantIsolation,
  getTenantIsolation,
  listTenantIsolations,
} from "./isolation/isolation.registry";

export type {
  CreateTenantLifecycleInput,
  LifecycleMetadata,
  TenantLifecycle,
  TenantLifecycleState,
  TransitionTenantLifecycleInput,
} from "./lifecycle/lifecycle.types";

export {
  clearTenantLifecycles,
  createTenantLifecycle,
  getTenantLifecycle,
  listTenantLifecycles,
  transitionTenantLifecycle,
} from "./lifecycle/lifecycle.registry";

export {
  assertTenantAdministrationReadinessReady,
  evaluateTenantAdministrationReadiness,
} from "./administration/administration.readiness";

export {
  clearTenantAdministrationLayer,
  createTenantManager,
  getTenantRegistryManifest,
  type TenantManager,
  type TenantManagerSnapshot,
} from "./tenant.manager";

export {
  assertProductTenantReleaseGatePass,
  checkProductTenantReleaseGate,
  PRODUCT_TENANT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
