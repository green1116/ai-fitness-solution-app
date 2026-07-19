/**
 * E09-P3 — Market Intelligence
 * Analyzes market signals into insights (reuse market.types)
 */

import { getMarket } from "./market.registry";
import {
  getSignals,
  type MarketSignal,
  type MarketSignalKind,
} from "./market.signal";
import type { Market, MarketStatus, MarketType } from "./market.types";

export const MARKET_INSIGHT_LEVELS = [
  "LOW",
  "MODERATE",
  "HIGH",
  "CRITICAL",
] as const;

export type MarketInsightLevel = (typeof MARKET_INSIGHT_LEVELS)[number];

export type MarketKindSummary = {
  kind: MarketSignalKind;
  count: number;
  avgStrength: number;
};

export type MarketAnalysis = {
  marketId: Market["id"];
  marketCode: Market["code"];
  marketType: MarketType;
  marketStatus: MarketStatus;
  signalCount: number;
  avgStrength: number;
  score: number;
  level: MarketInsightLevel;
  kindSummaries: MarketKindSummary[];
  topSignals: MarketSignal[];
  findings: string[];
  analyzedAt: string;
};

export type MarketInsight = {
  id: string;
  marketId: Market["id"];
  level: MarketInsightLevel;
  score: number;
  headline: string;
  summary: string;
  recommendations: string[];
  signalCount: number;
  analyzedAt: string;
};

const insights = new Map<string, MarketInsight>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInsight(insight: MarketInsight): MarketInsight {
  return {
    ...insight,
    recommendations: [...insight.recommendations],
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelFromScore(score: number): MarketInsightLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  return "LOW";
}

function statusBias(status: MarketStatus): number {
  switch (status) {
    case "ACTIVE":
      return 10;
    case "CONNECTED":
      return 5;
    case "SUSPENDED":
      return -20;
    default:
      return 0;
  }
}

function summarizeKinds(signals: MarketSignal[]): MarketKindSummary[] {
  const buckets = new Map<MarketSignalKind, { count: number; total: number }>();
  for (const signal of signals) {
    const bucket = buckets.get(signal.kind) ?? { count: 0, total: 0 };
    bucket.count += 1;
    bucket.total += signal.strength;
    buckets.set(signal.kind, bucket);
  }

  return [...buckets.entries()]
    .map(([kind, bucket]) => ({
      kind,
      count: bucket.count,
      avgStrength: Math.round((bucket.total / bucket.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgStrength - a.avgStrength || a.kind.localeCompare(b.kind));
}

function buildFindings(
  market: Market,
  signals: MarketSignal[],
  kindSummaries: MarketKindSummary[],
): string[] {
  const findings: string[] = [];

  if (market.status === "SUSPENDED") {
    findings.push("market is SUSPENDED — intelligence confidence reduced");
  }
  if (signals.length === 0) {
    findings.push("no signals recorded for this market");
  }

  const risk = kindSummaries.find((k) => k.kind === "RISK");
  if (risk && risk.avgStrength >= 70) {
    findings.push(`elevated RISK signals (avg=${risk.avgStrength})`);
  }

  const opportunity = kindSummaries.find((k) => k.kind === "OPPORTUNITY");
  if (opportunity && opportunity.avgStrength >= 70) {
    findings.push(`strong OPPORTUNITY signals (avg=${opportunity.avgStrength})`);
  }

  const demand = kindSummaries.find((k) => k.kind === "DEMAND");
  const supply = kindSummaries.find((k) => k.kind === "SUPPLY");
  if (demand && supply && demand.avgStrength - supply.avgStrength >= 25) {
    findings.push("demand outpaces supply");
  } else if (supply && demand && supply.avgStrength - demand.avgStrength >= 25) {
    findings.push("supply outpaces demand");
  }

  return findings;
}

function buildRecommendations(
  analysis: MarketAnalysis,
): string[] {
  const recommendations: string[] = [];

  if (analysis.signalCount === 0) {
    recommendations.push("record market signals before acting on insight");
    return recommendations;
  }

  if (analysis.level === "CRITICAL" || analysis.level === "HIGH") {
    recommendations.push("prioritize review of top-strength signals");
  }

  for (const finding of analysis.findings) {
    if (finding.includes("RISK")) {
      recommendations.push("mitigate risk posture before expanding market ops");
    }
    if (finding.includes("OPPORTUNITY")) {
      recommendations.push("evaluate expansion against opportunity signals");
    }
    if (finding.includes("demand outpaces")) {
      recommendations.push("increase supply coverage or capacity");
    }
    if (finding.includes("supply outpaces")) {
      recommendations.push("stimulate demand or rebalance inventory");
    }
    if (finding.includes("SUSPENDED")) {
      recommendations.push("restore market to ACTIVE before scaling");
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      `retain ${analysis.marketType} posture — score=${analysis.score}`,
    );
  }

  return recommendations;
}

/** Analyze a registered market using recorded signals. */
export function analyzeMarket(marketId: string): MarketAnalysis {
  const id = marketId.trim();
  if (!id) throw new Error("marketId is required");

  const market = getMarket(id);
  if (!market) throw new Error(`market not found: ${id}`);

  const signals = getSignals({ marketId: id });
  const avgStrength =
    signals.length === 0
      ? 0
      : signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

  const kindSummaries = summarizeKinds(signals);
  const findings = buildFindings(market, signals, kindSummaries);

  const riskPenalty =
    kindSummaries.find((k) => k.kind === "RISK")?.avgStrength ?? 0;
  const opportunityBoost =
    kindSummaries.find((k) => k.kind === "OPPORTUNITY")?.avgStrength ?? 0;

  const rawScore =
    avgStrength +
    statusBias(market.status) +
    opportunityBoost * 0.15 -
    riskPenalty * 0.2 -
    findings.filter((f) => f.includes("no signals")).length * 15;

  const score = clampScore(rawScore);
  const level = levelFromScore(score);

  const topSignals = signals
    .slice()
    .sort((a, b) => b.strength - a.strength || a.id.localeCompare(b.id))
    .slice(0, 5)
    .map((s) => ({ ...s, payload: { ...s.payload } }));

  return {
    marketId: market.id,
    marketCode: market.code,
    marketType: market.type,
    marketStatus: market.status,
    signalCount: signals.length,
    avgStrength: Math.round(avgStrength * 10) / 10,
    score,
    level,
    kindSummaries,
    topSignals,
    findings,
    analyzedAt: nowIso(),
  };
}

/** Build (or refresh) a durable insight snapshot for a market. */
export function getMarketInsight(
  marketId: string,
  options?: { refresh?: boolean },
): MarketInsight {
  const id = marketId.trim();
  if (!id) throw new Error("marketId is required");

  if (!options?.refresh) {
    const existing = insights.get(id);
    if (existing) return cloneInsight(existing);
  }

  const analysis = analyzeMarket(id);
  const recommendations = buildRecommendations(analysis);

  const headline =
    analysis.signalCount === 0
      ? `${analysis.marketCode}: insufficient signal coverage`
      : analysis.level === "CRITICAL" || analysis.level === "HIGH"
        ? `${analysis.marketCode}: elevated market attention (${analysis.level})`
        : `${analysis.marketCode}: stable market posture (${analysis.level})`;

  const summary = [
    `market=${analysis.marketId}`,
    `type=${analysis.marketType}`,
    `status=${analysis.marketStatus}`,
    `signals=${analysis.signalCount}`,
    `avgStrength=${analysis.avgStrength}`,
    `score=${analysis.score}`,
    `level=${analysis.level}`,
  ].join(" ");

  const insight: MarketInsight = {
    id: createId("mkt-insight"),
    marketId: analysis.marketId,
    level: analysis.level,
    score: analysis.score,
    headline,
    summary,
    recommendations,
    signalCount: analysis.signalCount,
    analyzedAt: analysis.analyzedAt,
  };

  insights.set(analysis.marketId, insight);
  return cloneInsight(insight);
}

export function clearMarketInsights(marketId?: Market["id"]): void {
  if (!marketId) {
    insights.clear();
    return;
  }
  insights.delete(marketId.trim());
}

export function listMarketInsights(): MarketInsight[] {
  return [...insights.values()]
    .sort((a, b) => a.marketId.localeCompare(b.marketId))
    .map(cloneInsight);
}
