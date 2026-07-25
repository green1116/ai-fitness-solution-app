/**
 * Product Admin — Admin Foundation public exports
 * Isolated namespace: lib/product/admin
 */

export {
  ADMIN_MANAGER_STATUSES,
  ADMIN_OPERATOR_ROLES,
  ADMIN_OPERATOR_STATUSES,
  ADMIN_POLICY_EFFECTS,
  ADMIN_POLICY_STATUSES,
  ADMIN_READINESS_VERDICTS,
  ADMIN_SETTING_SCOPES,
  ADMIN_TENANT_KINDS,
  ADMIN_TENANT_STATUSES,
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
  PRODUCT_ADMIN_FREEZE_VERSION,
} from "./foundation/foundation.constants";

export type {
  AdminManagerStatus,
  AdminReadinessCheck,
  AdminReadinessResult,
  AdminReadinessVerdict,
  AdminRegistryManifest,
} from "./foundation/foundation.types";

export type {
  AdminTenant,
  AdminTenantKind,
  AdminTenantStatus,
  RegisterAdminTenantInput,
  TenantMetadata,
  UpdateAdminTenantStatusInput,
} from "./tenant/tenant.types";

export {
  clearAdminTenants,
  getAdminTenant,
  listAdminTenants,
  registerAdminTenant,
  updateAdminTenantStatus,
} from "./tenant/tenant.registry";

export type {
  AdminSetting,
  AdminSettingScope,
  RegisterAdminSettingInput,
  SettingMetadata,
} from "./setting/setting.types";

export {
  clearAdminSettings,
  getAdminSetting,
  listAdminSettings,
  registerAdminSetting,
} from "./setting/setting.registry";

export type {
  AdminOperator,
  AdminOperatorRole,
  AdminOperatorStatus,
  OperatorMetadata,
  RegisterAdminOperatorInput,
  UpdateAdminOperatorStatusInput,
} from "./operator/operator.types";

export {
  clearAdminOperators,
  getAdminOperator,
  listAdminOperators,
  registerAdminOperator,
  updateAdminOperatorStatus,
} from "./operator/operator.registry";

export type {
  AdminPolicy,
  AdminPolicyEffect,
  AdminPolicyStatus,
  EnforceAdminPolicyInput,
  PolicyMetadata,
  RegisterAdminPolicyInput,
} from "./policy/policy.types";

export {
  clearAdminPolicies,
  enforceAdminPolicy,
  getAdminPolicy,
  listAdminPolicies,
  registerAdminPolicy,
} from "./policy/policy.registry";

export {
  assertAdminFoundationReadinessReady,
  evaluateAdminFoundationReadiness,
} from "./foundation/foundation.readiness";

export {
  clearAdminFoundationLayer,
  createAdminManager,
  getAdminRegistryManifest,
  type AdminManager,
  type AdminManagerSnapshot,
} from "./admin.manager";

export {
  assertProductAdminReleaseGatePass,
  checkProductAdminReleaseGate,
  PRODUCT_ADMIN_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
