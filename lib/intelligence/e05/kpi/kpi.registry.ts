/**
 * E05-P3 — KPI Registry
 * Binds KPI definitions onto E05 analytics
 */

import { getAnalyticsById } from "../analytics/analytics.registry";
import { getMetricById } from "../analytics/analytics.metric";
import {
  E05_KPI_BASE,
  E05_KPI_ENGINE_ID,
  E05_KPI_FREEZE_VERSION,
  E05_KPI_VERSION,
} from "./kpi.constants";
import type { KpiDefinition, KpiRegistryManifest } from "./kpi.types";

export const KPI_CATALOG: KpiDefinition[] = [
  {
    id: "e05.kpi.opportunity",
    name: "Opportunity KPI",
    description: "Interpret opportunity score readiness",
    kind: "threshold",
    analyticsId: "e05.analytics.opportunity",
    metricId: "e05.metric.opportunity-score",
    thresholds: { green: 80, amber: 60, readOnly: true },
    target: 85,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.kpi.pricing",
    name: "Pricing KPI",
    description: "Interpret commercial pricing band posture",
    kind: "target",
    analyticsId: "e05.analytics.pricing",
    metricId: "e05.metric.pricing-band",
    thresholds: { green: 3, amber: 2, readOnly: true },
    target: 3,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.kpi.risk",
    name: "Risk KPI",
    description: "Interpret equipment risk index",
    kind: "threshold",
    analyticsId: "e05.analytics.risk",
    metricId: "e05.metric.risk-index",
    thresholds: { green: 30, amber: 60, lowerIsBetter: true, readOnly: true },
    target: 25,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.kpi.compliance",
    name: "Compliance KPI",
    description: "Interpret compliance readiness ratio",
    kind: "threshold",
    analyticsId: "e05.analytics.compliance",
    metricId: "e05.metric.compliance-ratio",
    thresholds: { green: 0.9, amber: 0.75, readOnly: true },
    target: 0.95,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.kpi.delivery",
    name: "Delivery KPI",
    description: "Interpret delivery milestone coverage",
    kind: "target",
    analyticsId: "e05.analytics.delivery",
    metricId: "e05.metric.delivery-count",
    thresholds: { green: 5, amber: 3, readOnly: true },
    target: 6,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.kpi.synthesis",
    name: "Synthesis KPI",
    description: "Interpret cross-domain synthesis index",
    kind: "composite",
    analyticsId: "e05.analytics.synthesis",
    metricId: "e05.metric.synthesis-index",
    thresholds: { green: 75, amber: 55, readOnly: true },
    target: 80,
    optional: true,
    readOnly: true,
  },
];

export function assertKpiDefinition(kpi: KpiDefinition): void {
  if (!kpi.id.trim()) throw new Error("kpi.id is required");
  if (!kpi.name.trim()) throw new Error("kpi.name is required");
  if (kpi.readOnly !== true) throw new Error("readOnly must be true");

  const analytics = getAnalyticsById(kpi.analyticsId);
  if (!analytics) {
    throw new Error(`unknown analytics: ${kpi.analyticsId}`);
  }
  if (!analytics.metricIds.includes(kpi.metricId)) {
    throw new Error(`metric ${kpi.metricId} not on analytics ${kpi.analyticsId}`);
  }
  if (!getMetricById(kpi.metricId)) {
    throw new Error(`unknown metric: ${kpi.metricId}`);
  }
}

export function buildKpiRegistryManifest(
  kpis: KpiDefinition[] = KPI_CATALOG,
): KpiRegistryManifest {
  for (const kpi of kpis) {
    assertKpiDefinition(kpi);
  }

  const required = kpis.some((k) => !k.optional);
  if (!required) {
    throw new Error("kpi catalog missing required entry");
  }

  return {
    engineId: E05_KPI_ENGINE_ID,
    version: E05_KPI_VERSION,
    freezeVersion: E05_KPI_FREEZE_VERSION,
    base: E05_KPI_BASE,
    kpiCount: kpis.length,
    kpis,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getKpiById(id: string): KpiDefinition | undefined {
  return KPI_CATALOG.find((k) => k.id === id);
}

export function listRequiredKpis(): KpiDefinition[] {
  return KPI_CATALOG.filter((k) => !k.optional);
}
