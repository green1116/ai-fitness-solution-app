/**
 * Product Billing — Billing Foundation public exports
 * Isolated namespace: lib/product/billing
 */

export {
  BILLING_ACCOUNT_STATUSES,
  BILLING_MANAGER_STATUSES,
  BILLING_PLAN_TIERS,
  BILLING_READINESS_VERDICTS,
  INVOICE_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_BILLING_FOUNDATION_BASE,
  PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
  PRODUCT_BILLING_FOUNDATION_ID,
  PRODUCT_BILLING_FOUNDATION_VERSION,
  PRODUCT_BILLING_FREEZE_VERSION,
} from "./foundation/foundation.constants";

export type {
  BillingManagerStatus,
  BillingReadinessCheck,
  BillingReadinessResult,
  BillingReadinessVerdict,
  BillingRegistryManifest,
} from "./foundation/foundation.types";

export type {
  AccountMetadata,
  BillingAccount,
  BillingAccountStatus,
  OpenBillingAccountInput,
  UpdateBillingAccountStatusInput,
} from "./account/account.types";

export {
  clearBillingAccounts,
  getBillingAccount,
  listBillingAccounts,
  openBillingAccount,
  updateBillingAccountStatus,
} from "./account/account.registry";

export type {
  BillingPlan,
  BillingPlanTier,
  PlanMetadata,
  RegisterBillingPlanInput,
} from "./plan/plan.types";

export {
  clearBillingPlans,
  getBillingPlan,
  listBillingPlans,
  registerBillingPlan,
} from "./plan/plan.registry";

export type {
  BillingInvoice,
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
  BillingPayment,
  CapturePaymentInput,
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

export {
  assertBillingFoundationReadinessReady,
  evaluateBillingFoundationReadiness,
} from "./foundation/foundation.readiness";

export {
  clearBillingFoundationLayer,
  createBillingManager,
  getBillingRegistryManifest,
  type BillingManager,
  type BillingManagerSnapshot,
} from "./billing.manager";

export {
  assertProductBillingReleaseGatePass,
  checkProductBillingReleaseGate,
  PRODUCT_BILLING_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
