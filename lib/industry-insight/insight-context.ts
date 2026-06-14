import type { RegistryValidation } from "./shared/types";
import { buildIndustryInsights } from "./insight-registry";
import type { IndustryInsightType, InsightContext } from "./shared/types";
import {
  CANONICAL_INSIGHT_SUBJECT_ID,
  INDUSTRY_INSIGHT_TAG,
  INDUSTRY_INSIGHT_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  insights: ReturnType<typeof buildIndustryInsights>,
): Record<IndustryInsightType, number> {
  const breakdown: Record<IndustryInsightType, number> = {
    trend: 0,
    opportunity: 0,
    risk: 0,
    growth: 0,
    "network-change": 0,
  };

  for (const insight of insights) {
    breakdown[insight.insightType] += 1;
  }

  return breakdown;
}

export function buildInsightContext(): InsightContext {
  const insights = buildIndustryInsights();

  return {
    contextId: `insight-context-${INDUSTRY_INSIGHT_VERSION}`,
    insights,
    insightCount: insights.length,
    typeBreakdown: buildTypeBreakdown(insights),
    insightReady: insights.length > 0,
    mode: "industry-insight",
  };
}

export function validateInsightContextState(context: InsightContext): boolean {
  const canonicalInsights = context.insights.filter(
    (insight) => insight.subjectId === CANONICAL_INSIGHT_SUBJECT_ID,
  );

  return (
    context.insightReady &&
    context.insightCount >= 10 &&
    context.insights.length === context.insightCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    canonicalInsights.length >= 3 &&
    context.mode === "industry-insight"
  );
}

export function validateInsightContextRegistry(): RegistryValidation {
  const context = buildInsightContext();
  const valid =
    validateInsightContextState(context) &&
    INDUSTRY_INSIGHT_VERSION === "v33-industry-insight-1" &&
    INDUSTRY_INSIGHT_TAG === "v33-industry-insight-foundation";

  return {
    valid,
    count: context.insightCount,
    summary: `insight-context count=${context.insightCount} types=5/5 ready=${context.insightReady} valid=${valid}`,
  };
}
