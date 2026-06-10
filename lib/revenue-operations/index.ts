/**
 * V15 Revenue Operations Platform — lead/customer/trial/conversion/renewal/churn/revenue analytics.
 * No real CRM or payment gateway; decoupled from commercial-delivery production layer.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./lead";
export * from "./opportunity";
export * from "./customer";
export * from "./trial";
export * from "./conversion";
export * from "./renewal";
export * from "./churn";
export * from "./revenue-analytics";
export * from "./dashboard";
export {
  REVENUE_OPS_DOMAINS,
  buildRevenueOperationsEvidence,
} from "./evidence";
