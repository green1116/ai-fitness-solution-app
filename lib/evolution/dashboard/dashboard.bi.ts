/**
 * Evolution P4 — Business Intelligence View
 */

import { BI_VIEW_MODES } from "./dashboard.constants";
import { getExecutiveAnalytics } from "./dashboard.executive";
import { listOperationalInsights } from "./dashboard.insights";
import { getCrossPlatformMetrics } from "./dashboard.metrics";
import { getIntelligenceDashboard } from "./dashboard.model";
import type {
  BiViewMode,
  BusinessIntelligenceView,
  RenderBusinessIntelligenceViewInput,
} from "./dashboard.types";

const views = new Map<string, BusinessIntelligenceView>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneView(view: BusinessIntelligenceView): BusinessIntelligenceView {
  return { ...view };
}

export function renderBusinessIntelligenceView(
  input: RenderBusinessIntelligenceViewInput,
): BusinessIntelligenceView {
  const dashboard = getIntelligenceDashboard(
    input.intelligenceDashboardId.trim(),
  );
  if (!dashboard) {
    throw new Error(
      `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
    );
  }

  const mode: BiViewMode = input.mode ?? "SUMMARY";
  if (!(BI_VIEW_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid BI view mode: ${mode}`);
  }

  let executiveScore = dashboard.compositeScore;
  let trend = "UNKNOWN";
  if (input.executiveAnalyticsId) {
    const analytics = getExecutiveAnalytics(input.executiveAnalyticsId.trim());
    if (
      !analytics ||
      analytics.intelligenceDashboardId !== dashboard.id
    ) {
      throw new Error(
        `executive analytics not found: ${input.executiveAnalyticsId}`,
      );
    }
    executiveScore = analytics.executiveScore;
    trend = analytics.trend;
  }

  let coverage = 0;
  let kpiCount = 4;
  if (input.crossPlatformMetricsId) {
    const metrics = getCrossPlatformMetrics(
      input.crossPlatformMetricsId.trim(),
    );
    if (
      !metrics ||
      metrics.intelligenceDashboardId !== dashboard.id
    ) {
      throw new Error(
        `cross-platform metrics not found: ${input.crossPlatformMetricsId}`,
      );
    }
    coverage = metrics.coverage;
    kpiCount = metrics.metrics.filter((m) => m.present).length;
  }

  const insights = listOperationalInsights({
    intelligenceDashboardId: dashboard.id,
  });
  const insightCount = insights.length;
  const biScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        executiveScore * 0.6 + coverage * 0.25 + Math.min(20, insightCount * 3),
      ),
    ),
  );

  const headline =
    mode === "DETAIL"
      ? "Enterprise intelligence detail view"
      : mode === "COMPARATIVE"
        ? "Cross-domain comparative intelligence"
        : "Enterprise intelligence summary";

  const narrative = [
    `composite=${dashboard.compositeScore}`,
    `executive=${executiveScore}`,
    `trend=${trend}`,
    `coverage=${coverage}%`,
    `insights=${insightCount}`,
  ].join(" ");

  const id = input.id?.trim() || createId("biview");
  if (views.has(id)) {
    throw new Error(`business intelligence view already exists: ${id}`);
  }

  const view: BusinessIntelligenceView = {
    id,
    intelligenceDashboardId: dashboard.id,
    mode,
    headline,
    kpiCount,
    insightCount,
    biScore,
    narrative,
    detail: `mode=${mode} biScore=${biScore}`,
    renderedAt: nowIso(),
  };
  views.set(id, view);
  return cloneView(view);
}

export function getBusinessIntelligenceView(
  id: string,
): BusinessIntelligenceView | undefined {
  const view = views.get(id.trim());
  return view ? cloneView(view) : undefined;
}

export function listBusinessIntelligenceViews(filter?: {
  intelligenceDashboardId?: string;
  mode?: BiViewMode;
}): BusinessIntelligenceView[] {
  let result = [...views.values()];
  if (filter?.intelligenceDashboardId) {
    const did = filter.intelligenceDashboardId.trim();
    result = result.filter((v) => v.intelligenceDashboardId === did);
  }
  if (filter?.mode) result = result.filter((v) => v.mode === filter.mode);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneView);
}

export function clearBusinessIntelligenceViews(): void {
  views.clear();
}
