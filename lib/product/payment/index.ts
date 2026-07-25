/**
 * Product Payment — Payment Integration public exports
 * Isolated namespace: lib/product/payment
 */

export {
  INTENT_STATUSES,
  PAYMENT_MANAGER_STATUSES,
  PAYMENT_PROVIDER_KINDS,
  PAYMENT_READINESS_VERDICTS,
  PRODUCT_PAYMENT_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
  PROVIDER_STATUSES,
  REFUND_RESULTS,
} from "./integration/integration.constants";

export type {
  PaymentManagerStatus,
  PaymentReadinessCheck,
  PaymentReadinessResult,
  PaymentReadinessVerdict,
  PaymentRegistryManifest,
} from "./integration/integration.types";

export type {
  DisableProviderInput,
  PaymentProvider,
  PaymentProviderKind,
  ProviderMetadata,
  ProviderStatus,
  RegisterProviderInput,
} from "./provider/provider.types";

export {
  clearProviders,
  disableProvider,
  getProvider,
  listProviders,
  registerProvider,
} from "./provider/provider.registry";

export type {
  AuthorizeIntentInput,
  CancelIntentInput,
  CreateIntentInput,
  IntentMetadata,
  IntentStatus,
  PaymentIntent,
} from "./intent/intent.types";

export {
  authorizeIntent,
  cancelIntent,
  clearIntents,
  createIntent,
  getIntent,
  listIntents,
} from "./intent/intent.registry";

export type {
  CaptureIntentInput,
  CaptureMetadata,
  PaymentCapture,
} from "./capture/capture.types";

export {
  captureIntent,
  clearCaptures,
  getCapture,
  listCaptures,
} from "./capture/capture.registry";

export type {
  PaymentRefund,
  RefundCaptureInput,
  RefundMetadata,
  RefundResult,
} from "./refund/refund.types";

export {
  clearRefunds,
  getRefund,
  listRefunds,
  refundCapture,
} from "./refund/refund.registry";

export {
  assertPaymentIntegrationReadinessReady,
  evaluatePaymentIntegrationReadiness,
} from "./integration/integration.readiness";

export {
  clearPaymentIntegrationLayer,
  createPaymentManager,
  getPaymentRegistryManifest,
  type PaymentManager,
  type PaymentManagerSnapshot,
} from "./payment.manager";

export {
  assertProductPaymentReleaseGatePass,
  checkProductPaymentReleaseGate,
  PRODUCT_PAYMENT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
