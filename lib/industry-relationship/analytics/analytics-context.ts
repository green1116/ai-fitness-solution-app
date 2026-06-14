import type { RegistryValidation } from "../shared/types";
import { buildNetworkSnapshot } from "./network-snapshot";
import type { IndustryAnalyticsContext } from "./types";
import { INDUSTRY_ANALYTICS_TAG, INDUSTRY_ANALYTICS_VERSION } from "./types";

export function buildIndustryAnalyticsContext(): IndustryAnalyticsContext {
  const snapshot = buildNetworkSnapshot();

  return {
    contextId: `industry-analytics-context-${INDUSTRY_ANALYTICS_VERSION}`,
    snapshot,
    metrics: snapshot.metrics,
    analyticsReady:
      snapshot.metrics.nodeCount > 0 &&
      snapshot.metrics.edgeCount > 0 &&
      snapshot.topConnectedNodes.length > 0,
    mode: "industry-network-analytics",
  };
}

export function validateIndustryAnalyticsContext(context: IndustryAnalyticsContext): boolean {
  const requiredTypes = Object.values(context.metrics.relationshipTypeBreakdown);
  return (
    context.analyticsReady &&
    context.snapshot.nodeDegrees.length >= 10 &&
    context.metrics.nodeCount === context.snapshot.metrics.nodeCount &&
    requiredTypes.every((count) => count > 0) &&
    context.metrics.categoryCoverage > 0.2 &&
    context.metrics.organizationCoverage >= 0.7 &&
    context.mode === "industry-network-analytics"
  );
}

export function validateAnalyticsContextRegistry(): RegistryValidation {
  const context = buildIndustryAnalyticsContext();
  const valid =
    validateIndustryAnalyticsContext(context) &&
    INDUSTRY_ANALYTICS_VERSION === "v31-industry-analytics-1" &&
    INDUSTRY_ANALYTICS_TAG === "v31-industry-analytics-foundation";

  return {
    valid,
    count: context.snapshot.nodeDegrees.length,
    summary: `analytics-context ready=${context.analyticsReady} density=${context.metrics.relationshipDensity} orgCoverage=${context.metrics.organizationCoverage} valid=${valid}`,
  };
}
