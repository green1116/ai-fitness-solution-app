/**
 * V80 GTM P1 — Real customer activation entry (spec exports)
 */
export { V80_GTM_ACTIVATION_VERSION, V80_GTM_ACTIVATION_FREEZE_VERSION } from "./activation.types";
export type {
  FirstCustomerTarget,
  InitialSalesMotion,
  RevenueValidationStep,
  GtmEntryPoint,
  ActivationManifest,
  CustomerActivationReport,
} from "./activation.types";

export { FIRST_CUSTOMER_ACQUISITION, isFirstCustomerAcquisitionComplete } from "./activation.first-customer.spec";
export { INITIAL_SALES_MOTION, isInitialSalesMotionComplete } from "./activation.sales-motion.spec";
export { REVENUE_VALIDATION_LOOP, isRevenueValidationLoopComplete } from "./activation.validation-loop.spec";
export { GTM_ENTRY_POINTS, isGtmEntryPointsComplete } from "./activation.entry-channel.spec";

export {
  buildCustomerActivation,
  buildActivationManifest,
  assertCustomerActivationPass,
  formatActivationSummary,
  runCustomerActivation,
} from "./activation.builder";
