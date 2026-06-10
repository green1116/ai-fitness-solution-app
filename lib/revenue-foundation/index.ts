/**
 * V10 Revenue Foundation Layer — income model description runtimes.
 * No real payment gateway integration; read-only descriptive layer.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./trial";
export * from "./order";
export * from "./subscription";
export * from "./invoice";
export * from "./billing";
export * from "./dashboard";
export {
  REVENUE_FOUNDATION_DOMAINS,
  buildRevenueFoundationEvidence,
} from "./evidence";
