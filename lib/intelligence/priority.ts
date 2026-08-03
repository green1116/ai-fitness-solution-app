/**
 * WP-54 — Priority Engine
 * Deterministic priority queue from Insights + Recommendations (read-only).
 */
import {
  getInsights,
  type Insight,
  type InsightSeverity,
} from "./insight";
import {
  getRecommendations,
  type Recommendation,
  type RecommendationPriority,
} from "./recommendation";

export const FEAT_55_ID = "FEAT-55" as const;
export const PRIORITY_ENGINE_CAPABILITY = "PriorityEngine" as const;

export const PRIORITY_SOURCE_TYPES = ["INSIGHT", "RECOMMENDATION"] as const;

export type PrioritySourceType = (typeof PRIORITY_SOURCE_TYPES)[number];

export const PRIORITY_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export type PriorityItem = Readonly<{
  id: string;
  sourceType: PrioritySourceType;
  priority: PriorityLevel;
  title: string;
  reason: string;
}>;

export type BuildPriorityItemsInput = Readonly<{
  insights?: readonly Insight[];
  recommendations?: readonly Recommendation[];
}>;

const PRIORITY_RANK: Record<PriorityLevel, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const SOURCE_RANK: Record<PrioritySourceType, number> = {
  INSIGHT: 0,
  RECOMMENDATION: 1,
};

let cachedPriorityItems: PriorityItem[] | null = null;

function cloneItem(row: PriorityItem): PriorityItem {
  return { ...row };
}

function severityToPriority(severity: InsightSeverity): PriorityLevel {
  if (severity === "CRITICAL") return "HIGH";
  if (severity === "WARNING") return "MEDIUM";
  return "LOW";
}

function recommendationToPriority(
  priority: RecommendationPriority,
): PriorityLevel {
  return priority;
}

/**
 * Build deterministic priority items from Insights + Recommendations.
 */
export function buildPriorityItems(
  input: BuildPriorityItemsInput = {},
): PriorityItem[] {
  const insights = input.insights ? [...input.insights] : getInsights();
  const recommendations = input.recommendations
    ? [...input.recommendations]
    : getRecommendations();

  const out: PriorityItem[] = [];

  for (const ins of insights) {
    out.push({
      id: `pri-insight-${ins.id}`,
      sourceType: "INSIGHT",
      priority: severityToPriority(ins.severity),
      title: ins.title,
      reason: `insight=${ins.id}; severity=${ins.severity}; ${ins.summary}`,
    });
  }

  for (const rec of recommendations) {
    out.push({
      id: `pri-rec-${rec.id}`,
      sourceType: "RECOMMENDATION",
      priority: recommendationToPriority(rec.priority),
      title: rec.title,
      reason: `recommendation=${rec.id}; priority=${rec.priority}; ${rec.reason}`,
    });
  }

  out.sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    const bySource = SOURCE_RANK[a.sourceType] - SOURCE_RANK[b.sourceType];
    if (bySource !== 0) return bySource;
    return a.id.localeCompare(b.id);
  });

  cachedPriorityItems = out.map(cloneItem);
  return cachedPriorityItems.map(cloneItem);
}

/**
 * Get the last built priority items, or build if none cached.
 */
export function getPriorityItems(): PriorityItem[] {
  if (!cachedPriorityItems) {
    return buildPriorityItems();
  }
  return cachedPriorityItems.map(cloneItem);
}

/** Test helper — clears cached priority items. */
export function clearPriorityItems(): void {
  cachedPriorityItems = null;
}
