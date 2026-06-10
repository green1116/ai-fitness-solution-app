/**
 * V17 Go-To-Market Platform — launch/campaign/lead/outreach/segment/analytics.
 * No real ad platforms, marketing automation, or CRM.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./product-launch";
export * from "./campaign";
export * from "./lead-acquisition";
export * from "./outreach";
export * from "./market-segment";
export * from "./gtm-analytics";
export * from "./dashboard";
export { GTM_DOMAINS, buildGtmEvidence } from "./evidence";
