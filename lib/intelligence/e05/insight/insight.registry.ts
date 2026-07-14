/**
 * E05-P1 — Insight Registry
 */

import { INSIGHT_KINDS } from "../core/intelligence.constants";
import type { InsightKind } from "../core/intelligence.types";
import type {
  InsightDefinition,
  InsightRegistryManifest,
} from "./insight.types";

export const INSIGHT_CATALOG: InsightDefinition[] = [
  {
    id: "e05.insight.signal",
    kind: "signal",
    name: "Business Signal",
    description: "Extract actionable signals from business context",
    inputHints: ["goal", "projectHint"],
    outputHints: ["signals", "confidence"],
    readOnly: true,
  },
  {
    id: "e05.insight.trend",
    kind: "trend",
    name: "Trend Insight",
    description: "Identify directional trends across domain facts",
    inputHints: ["history", "baseline"],
    outputHints: ["trend", "direction"],
    readOnly: true,
  },
  {
    id: "e05.insight.anomaly",
    kind: "anomaly",
    name: "Anomaly Insight",
    description: "Flag outliers and risk anomalies",
    inputHints: ["metrics", "thresholds"],
    outputHints: ["anomalies", "severity"],
    readOnly: true,
  },
  {
    id: "e05.insight.recommendation",
    kind: "recommendation",
    name: "Recommendation Insight",
    description: "Produce ranked business recommendations",
    inputHints: ["options", "constraints"],
    outputHints: ["recommendations", "rationale"],
    readOnly: true,
  },
  {
    id: "e05.insight.forecast",
    kind: "forecast",
    name: "Forecast Insight",
    description: "Forecast near-term commercial or delivery posture",
    inputHints: ["drivers", "horizon"],
    outputHints: ["forecast", "band"],
    readOnly: true,
  },
  {
    id: "e05.insight.score",
    kind: "score",
    name: "Score Insight",
    description: "Score opportunity or readiness",
    inputHints: ["criteria", "weights"],
    outputHints: ["score", "breakdown"],
    readOnly: true,
  },
];

export function getInsightById(id: string): InsightDefinition | undefined {
  return INSIGHT_CATALOG.find((i) => i.id === id);
}

export function listInsightsByKind(kind: InsightKind): InsightDefinition[] {
  return INSIGHT_CATALOG.filter((i) => i.kind === kind);
}

export function buildInsightRegistryManifest(
  insights: InsightDefinition[] = INSIGHT_CATALOG,
): InsightRegistryManifest {
  const kinds = new Set(insights.map((i) => i.kind));
  const catalogComplete = INSIGHT_KINDS.every((k) => kinds.has(k));
  if (!catalogComplete) {
    throw new Error("Insight catalog incomplete: missing kinds");
  }

  return {
    insightCount: insights.length,
    kinds: [...kinds] as InsightKind[],
    insights,
    catalogComplete: true,
    readOnly: true,
  };
}
