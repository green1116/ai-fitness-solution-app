/**
 * V16 Customer Success Platform — health/adoption/expansion/renewal/playbook/audit.
 * No real CRM; decoupled from revenue-operations, commercial-delivery, autopilot, ai-integration.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./health";
export * from "./adoption";
export * from "./expansion";
export * from "./renewal-risk";
export * from "./playbook";
export * from "./audit";
export * from "./dashboard";
export {
  CUSTOMER_SUCCESS_DOMAINS,
  buildCustomerSuccessEvidence,
} from "./evidence";
