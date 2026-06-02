/**
 * V8.9 Expansion & Renewal Platform — expansion entry
 */

export * from "./types";
export { buildRenewalOpportunity } from "./renewal";
export { buildExpansionOpportunity, buildExpansionOpportunities } from "./expansion";
export { buildRenewalAndExpansionOpportunities } from "./opportunities";
export { buildRetentionProfile } from "./retention";
export {
  buildGrowthMetrics,
  buildExpansionSummary,
  buildExpansionRenewalResponse,
  validateExpansionRenewal,
} from "./growth";
