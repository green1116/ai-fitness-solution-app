/**
 * E05-P2 — Business Analytics Registry
 * Binds analytics onto E05 intelligence modules
 */

import { getIntelligenceById } from "../core/intelligence.registry";
import { getInsightById } from "../insight/insight.registry";
import {
  E05_ANALYTICS_BASE,
  E05_ANALYTICS_FREEZE_VERSION,
  E05_ANALYTICS_RUNTIME_ID,
  E05_ANALYTICS_VERSION,
} from "./analytics.constants";
import { getMetricById, METRIC_CATALOG } from "./analytics.metric";
import type {
  AnalyticsDefinition,
  AnalyticsRegistryManifest,
} from "./analytics.types";

export const ANALYTICS_CATALOG: AnalyticsDefinition[] = [
  {
    id: "e05.analytics.opportunity",
    name: "Opportunity Analytics",
    description: "Score opportunity signals from tender intelligence",
    intelligenceId: "e05.intel.opportunity",
    insightId: "e05.insight.score",
    metricIds: ["e05.metric.opportunity-score"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.analytics.pricing",
    name: "Pricing Analytics",
    description: "Derive pricing band analytics",
    intelligenceId: "e05.intel.pricing",
    insightId: "e05.insight.forecast",
    metricIds: ["e05.metric.pricing-band"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.analytics.risk",
    name: "Risk Analytics",
    description: "Compute risk index from equipment intelligence",
    intelligenceId: "e05.intel.risk",
    insightId: "e05.insight.anomaly",
    metricIds: ["e05.metric.risk-index"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.analytics.compliance",
    name: "Compliance Analytics",
    description: "Measure compliance readiness ratio",
    intelligenceId: "e05.intel.compliance",
    insightId: "e05.insight.score",
    metricIds: ["e05.metric.compliance-ratio"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.analytics.delivery",
    name: "Delivery Analytics",
    description: "Track delivery milestone counts",
    intelligenceId: "e05.intel.delivery",
    insightId: "e05.insight.signal",
    metricIds: ["e05.metric.delivery-count"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.analytics.synthesis",
    name: "Synthesis Analytics",
    description: "Roll up cross-domain synthesis index",
    intelligenceId: "e05.intel.synthesis",
    insightId: "e05.insight.recommendation",
    metricIds: ["e05.metric.synthesis-index"],
    optional: true,
    readOnly: true,
  },
];

export function assertAnalyticsDefinition(analytics: AnalyticsDefinition): void {
  if (!analytics.id.trim()) throw new Error("analytics.id is required");
  if (!analytics.name.trim()) throw new Error("analytics.name is required");
  if (analytics.readOnly !== true) throw new Error("readOnly must be true");

  const intel = getIntelligenceById(analytics.intelligenceId);
  if (!intel) {
    throw new Error(`unknown intelligence: ${analytics.intelligenceId}`);
  }

  if (analytics.insightId) {
    if (!getInsightById(analytics.insightId)) {
      throw new Error(`unknown insight: ${analytics.insightId}`);
    }
    if (!intel.insightIds.includes(analytics.insightId)) {
      throw new Error(
        `insight ${analytics.insightId} not owned by ${intel.id}`,
      );
    }
  }

  for (const metricId of analytics.metricIds) {
    if (!getMetricById(metricId)) {
      throw new Error(`unknown metric ${metricId} on ${analytics.id}`);
    }
  }
}

export function buildAnalyticsRegistryManifest(
  analytics: AnalyticsDefinition[] = ANALYTICS_CATALOG,
): AnalyticsRegistryManifest {
  for (const item of analytics) {
    assertAnalyticsDefinition(item);
  }

  const required = analytics.some((a) => !a.optional);
  if (!required) {
    throw new Error("analytics catalog missing required entry");
  }

  return {
    runtimeId: E05_ANALYTICS_RUNTIME_ID,
    version: E05_ANALYTICS_VERSION,
    freezeVersion: E05_ANALYTICS_FREEZE_VERSION,
    base: E05_ANALYTICS_BASE,
    analyticsCount: analytics.length,
    metricCount: METRIC_CATALOG.length,
    analytics,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getAnalyticsById(id: string): AnalyticsDefinition | undefined {
  return ANALYTICS_CATALOG.find((a) => a.id === id);
}

export function listRequiredAnalytics(): AnalyticsDefinition[] {
  return ANALYTICS_CATALOG.filter((a) => !a.optional);
}
