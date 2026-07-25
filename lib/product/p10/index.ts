/**
 * Product P10 — Subscription & Billing public exports
 * Isolated namespace: lib/product/p10
 */

export {
  BILLING_STATUSES,
  ENTITLEMENT_KINDS,
  INVOICE_STATUSES,
  P10_MANAGER_STATUSES,
  P10_READINESS_VERDICTS,
  PAYMENT_STATUSES,
  PLAN_TIERS,
  PRICING_BILLING_CYCLES,
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
  PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION,
  QUOTA_UNITS,
  SUBSCRIPTION_STATUSES,
} from "./subscription/subscription.constants";

export type {
  BindSubscriptionPlanInput,
  CreateSubscriptionInput,
  P10ManagerStatus,
  P10ReadinessCheck,
  P10ReadinessResult,
  P10ReadinessVerdict,
  P10RegistryManifest,
  Subscription,
  SubscriptionMetadata,
  SubscriptionStatus,
  UpdateSubscriptionStatusInput,
} from "./subscription/subscription.types";

export {
  bindSubscriptionPlan,
  clearSubscriptions,
  createSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscriptionStatus,
} from "./subscription/subscription.registry";

export type {
  PlanMetadata,
  PlanTier,
  RegisterPlanInput,
  SubscriptionPlan,
} from "./plan/plan.types";

export {
  clearPlans,
  getPlan,
  listPlans,
  registerPlan,
} from "./plan/plan.registry";

export type {
  CreatePricingInput,
  PricingBillingCycle,
  PricingMetadata,
  SubscriptionPricing,
} from "./pricing/pricing.types";

export {
  clearPricing,
  createPricing,
  getPricing,
  listPricing,
} from "./pricing/pricing.registry";

export type {
  BillingCycleRecord,
  BillingMetadata,
  BillingStatus,
  OpenBillingInput,
  UpdateBillingStatusInput,
} from "./billing/billing.types";

export {
  clearBilling,
  getBilling,
  listBilling,
  openBilling,
  updateBillingStatus,
} from "./billing/billing.registry";

export type {
  Invoice,
  InvoiceMetadata,
  InvoiceStatus,
  IssueInvoiceInput,
  UpdateInvoiceStatusInput,
} from "./invoice/invoice.types";

export {
  clearInvoices,
  getInvoice,
  issueInvoice,
  listInvoices,
  updateInvoiceStatus,
} from "./invoice/invoice.registry";

export type {
  CapturePaymentInput,
  Payment,
  PaymentMetadata,
  PaymentStatus,
  UpdatePaymentStatusInput,
} from "./payment/payment.types";

export {
  capturePayment,
  clearPayments,
  getPayment,
  listPayments,
  updatePaymentStatus,
} from "./payment/payment.registry";

export type {
  Entitlement,
  EntitlementKind,
  EntitlementMetadata,
  GrantEntitlementInput,
} from "./entitlement/entitlement.types";

export {
  clearEntitlements,
  getEntitlement,
  grantEntitlement,
  listEntitlements,
} from "./entitlement/entitlement.registry";

export type {
  ConsumeQuotaInput,
  CreateQuotaInput,
  Quota,
  QuotaMetadata,
  QuotaUnit,
} from "./quota/quota.types";

export {
  clearQuotas,
  consumeQuota,
  createQuota,
  getQuota,
  listQuotas,
} from "./quota/quota.registry";

export {
  assertP10SubscriptionBillingReadinessReady,
  evaluateP10SubscriptionBillingReadiness,
} from "./subscription/subscription.readiness";

export {
  clearP10SubscriptionBillingLayer,
  createP10SubscriptionManager,
  getP10RegistryManifest,
  type P10SubscriptionManager,
  type P10SubscriptionManagerSnapshot,
} from "./subscription.manager";

export {
  assertProductP10ReleaseGatePass,
  checkProductP10ReleaseGate,
  PRODUCT_P10_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
