/**
 * Product Subscription — Lifecycle public exports
 * Isolated namespace: lib/product/subscription
 */

export {
  CHANGE_KINDS,
  ENTITLEMENT_STATUSES,
  PRODUCT_SUBSCRIPTION_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
  RENEWAL_RESULTS,
  SUBSCRIPTION_MANAGER_STATUSES,
  SUBSCRIPTION_READINESS_VERDICTS,
  SUBSCRIPTION_STATUSES,
} from "./lifecycle/lifecycle.constants";

export type {
  SubscriptionManagerStatus,
  SubscriptionReadinessCheck,
  SubscriptionReadinessResult,
  SubscriptionReadinessVerdict,
  SubscriptionRegistryManifest,
} from "./lifecycle/lifecycle.types";

export type {
  CreateSubscriptionInput,
  ProductSubscription,
  SubscriptionMetadata,
  SubscriptionStatus,
  UpdateSubscriptionPlanInput,
  UpdateSubscriptionStatusInput,
} from "./subscription/subscription.types";

export {
  clearSubscriptions,
  createSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
} from "./subscription/subscription.registry";

export type {
  EntitlementMetadata,
  EntitlementStatus,
  GrantEntitlementInput,
  RevokeEntitlementInput,
  SubscriptionEntitlement,
} from "./entitlement/entitlement.types";

export {
  clearEntitlements,
  getEntitlement,
  grantEntitlement,
  listEntitlements,
  revokeEntitlement,
} from "./entitlement/entitlement.registry";

export type {
  RenewalMetadata,
  RenewalResult,
  RenewSubscriptionInput,
  SubscriptionRenewal,
} from "./renewal/renewal.types";

export {
  clearRenewals,
  getRenewal,
  listRenewals,
  renewSubscription,
} from "./renewal/renewal.registry";

export type {
  ChangeKind,
  ChangeMetadata,
  ChangeSubscriptionInput,
  SubscriptionChange,
} from "./change/change.types";

export {
  changeSubscription,
  clearChanges,
  getChange,
  listChanges,
} from "./change/change.registry";

export {
  assertSubscriptionLifecycleReadinessReady,
  evaluateSubscriptionLifecycleReadiness,
} from "./lifecycle/lifecycle.readiness";

export {
  clearSubscriptionLifecycleLayer,
  createSubscriptionManager,
  getSubscriptionRegistryManifest,
  type SubscriptionManager,
  type SubscriptionManagerSnapshot,
} from "./subscription.manager";

export {
  assertProductSubscriptionReleaseGatePass,
  checkProductSubscriptionReleaseGate,
  PRODUCT_SUBSCRIPTION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
