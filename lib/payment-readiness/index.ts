/**
 * V10.1 Payment Integration Readiness — unified payment abstraction layer.
 * No real payment API calls; no payment data persistence.
 * Decoupled from lib/revenue-foundation/.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./gateway";
export * from "./events";
export * from "./webhook";
export * from "./subscription-sync";
export * from "./invoice-settlement";
export * from "./dashboard";
export {
  PAYMENT_READINESS_DOMAINS,
  buildPaymentReadinessEvidence,
} from "./evidence";
