/**
 * E09-P3 — Cross-Market Signal Engine
 * Relationship analysis, correlation detection, and cross insights
 */

import { getMarket } from "./market.registry";
import { getSignals } from "./market.signal";
import {
  getCrossSignals,
  type CrossMarketRelation,
  type CrossMarketSignal,
} from "./cross-market.signal";
import type { Market, MarketStatus, MarketType } from "./market.types";

export const CROSS_CORRELATION_KINDS = [
  "POSITIVE",
  "NEGATIVE",
  "NEUTRAL",
  "INSUFFICIENT",
] as const;

export type CrossCorrelationKind = (typeof CROSS_CORRELATION_KINDS)[number];

export const CROSS_INSIGHT_LEVELS = [
  "LOW",
  "MODERATE",
  "HIGH",
  "CRITICAL",
] as const;

export type CrossInsightLevel = (typeof CROSS_INSIGHT_LEVELS)[number];

export type MarketPairRef = {
  marketId: Market["id"];
  code: Market["code"];
  type: MarketType;
  status: MarketStatus;
  regionId: Market["regionId"];
};

export type RelationSummary = {
  relation: CrossMarketRelation;
  count: number;
  avgStrength: number;
  netDirection: number;
};

export type MarketRelationshipAnalysis = {
  source: MarketPairRef;
  target: MarketPairRef;
  signalCount: number;
  avgStrength: number;
  dominantRelation: CrossMarketRelation | null;
  relationSummaries: RelationSummary[];
  sharedRegion: boolean;
  sameType: boolean;
  findings: string[];
  analyzedAt: string;
};

export type MarketCorrelation = {
  sourceMarketId: Market["id"];
  targetMarketId: Market["id"];
  kind: CrossCorrelationKind;
  /** Absolute correlation score 0–100 */
  score: number;
  /** Signed affinity −100…100 (positive = move together) */
  affinity: number;
  evidence: string[];
  signalCount: number;
  detectedAt: string;
};

export type CrossMarketInsight = {
  id: string;
  sourceMarketId: Market["id"];
  targetMarketId: Market["id"];
  level: CrossInsightLevel;
  score: number;
  correlation: MarketCorrelation;
  relationship: MarketRelationshipAnalysis;
  headline: string;
  summary: string;
  recommendations: string[];
  builtAt: string;
};

const insights = new Map<string, CrossMarketInsight>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function pairInsightKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampScore(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

function toPairRef(market: Market): MarketPairRef {
  return {
    marketId: market.id,
    code: market.code,
    type: market.type,
    status: market.status,
    regionId: market.regionId,
  };
}

function cloneRelationship(
  analysis: MarketRelationshipAnalysis,
): MarketRelationshipAnalysis {
  return {
    ...analysis,
    source: { ...analysis.source },
    target: { ...analysis.target },
    relationSummaries: analysis.relationSummaries.map((r) => ({ ...r })),
    findings: [...analysis.findings],
  };
}

function cloneCorrelation(correlation: MarketCorrelation): MarketCorrelation {
  return {
    ...correlation,
    evidence: [...correlation.evidence],
  };
}

function cloneInsight(insight: CrossMarketInsight): CrossMarketInsight {
  return {
    ...insight,
    recommendations: [...insight.recommendations],
    correlation: cloneCorrelation(insight.correlation),
    relationship: cloneRelationship(insight.relationship),
  };
}

function resolvePair(
  sourceMarketId: string,
  targetMarketId: string,
): { source: Market; target: Market } {
  const sourceId = sourceMarketId.trim();
  const targetId = targetMarketId.trim();
  if (!sourceId) throw new Error("sourceMarketId is required");
  if (!targetId) throw new Error("targetMarketId is required");
  if (sourceId === targetId) {
    throw new Error("source and target markets must differ");
  }

  const source = getMarket(sourceId);
  const target = getMarket(targetId);
  if (!source) throw new Error(`source market not found: ${sourceId}`);
  if (!target) throw new Error(`target market not found: ${targetId}`);
  return { source, target };
}

function summarizeRelations(signals: CrossMarketSignal[]): RelationSummary[] {
  const buckets = new Map<
    CrossMarketRelation,
    { count: number; total: number; net: number }
  >();

  for (const signal of signals) {
    const bucket = buckets.get(signal.relation) ?? {
      count: 0,
      total: 0,
      net: 0,
    };
    bucket.count += 1;
    bucket.total += signal.strength;
    // Directional lean: source→target positive, reverse negative for same pair view
    bucket.net += signal.strength;
    buckets.set(signal.relation, bucket);
  }

  return [...buckets.entries()]
    .map(([relation, bucket]) => ({
      relation,
      count: bucket.count,
      avgStrength: Math.round((bucket.total / bucket.count) * 10) / 10,
      netDirection: Math.round(bucket.net),
    }))
    .sort(
      (a, b) =>
        b.avgStrength - a.avgStrength || a.relation.localeCompare(b.relation),
    );
}

function levelFromScore(score: number): CrossInsightLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  return "LOW";
}

function relationAffinityBias(relation: CrossMarketRelation): number {
  switch (relation) {
    case "CORRELATED":
    case "COMPLEMENTARY":
    case "SUPPLY_CHAIN":
    case "SPILLOVER":
      return 1;
    case "COMPETITIVE":
    case "SUBSTITUTE":
      return -1;
    default:
      return 0;
  }
}

/** Analyze the directed/undirected relationship between two markets. */
export function analyzeRelationship(
  sourceMarketId: string,
  targetMarketId: string,
): MarketRelationshipAnalysis {
  const { source, target } = resolvePair(sourceMarketId, targetMarketId);
  const signals = getCrossSignals({
    pair: { a: source.id, b: target.id },
  });

  const avgStrength =
    signals.length === 0
      ? 0
      : signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

  const relationSummaries = summarizeRelations(signals);
  const dominantRelation = relationSummaries[0]?.relation ?? null;
  const sharedRegion = source.regionId === target.regionId;
  const sameType = source.type === target.type;

  const findings: string[] = [];
  if (signals.length === 0) {
    findings.push("no cross-market signals between this pair");
  }
  if (sharedRegion) {
    findings.push("markets share the same region");
  }
  if (sameType) {
    findings.push(`both markets are type ${source.type}`);
  }
  if (source.status === "SUSPENDED" || target.status === "SUSPENDED") {
    findings.push("at least one market is SUSPENDED");
  }
  if (dominantRelation === "COMPETITIVE" || dominantRelation === "SUBSTITUTE") {
    findings.push(`dominant relation is ${dominantRelation}`);
  }
  if (
    dominantRelation === "COMPLEMENTARY" ||
    dominantRelation === "SUPPLY_CHAIN"
  ) {
    findings.push(`dominant relation is ${dominantRelation}`);
  }

  return {
    source: toPairRef(source),
    target: toPairRef(target),
    signalCount: signals.length,
    avgStrength: Math.round(avgStrength * 10) / 10,
    dominantRelation,
    relationSummaries,
    sharedRegion,
    sameType,
    findings,
    analyzedAt: nowIso(),
  };
}

/** Detect correlation between two markets from cross signals + local signal posture. */
export function detectMarketCorrelation(
  sourceMarketId: string,
  targetMarketId: string,
): MarketCorrelation {
  const { source, target } = resolvePair(sourceMarketId, targetMarketId);
  const cross = getCrossSignals({
    pair: { a: source.id, b: target.id },
  });
  const sourceLocal = getSignals({ marketId: source.id });
  const targetLocal = getSignals({ marketId: target.id });

  const evidence: string[] = [];

  if (cross.length === 0) {
    return {
      sourceMarketId: source.id,
      targetMarketId: target.id,
      kind: "INSUFFICIENT",
      score: 0,
      affinity: 0,
      evidence: ["no cross-market signals to estimate correlation"],
      signalCount: 0,
      detectedAt: nowIso(),
    };
  }

  let weightedAffinity = 0;
  let weightSum = 0;
  for (const signal of cross) {
    const bias = relationAffinityBias(signal.relation);
    weightedAffinity += bias * signal.strength;
    weightSum += signal.strength;
    evidence.push(
      `${signal.relation} strength=${signal.strength} (${signal.label})`,
    );
  }

  let affinity = weightSum === 0 ? 0 : (weightedAffinity / weightSum) * 100;

  // Local signal posture: similar avg strength → reinforce positive affinity
  if (sourceLocal.length > 0 && targetLocal.length > 0) {
    const sourceAvg =
      sourceLocal.reduce((s, x) => s + x.strength, 0) / sourceLocal.length;
    const targetAvg =
      targetLocal.reduce((s, x) => s + x.strength, 0) / targetLocal.length;
    const delta = Math.abs(sourceAvg - targetAvg);
    const posture = clamp(25 - delta / 2, -15, 25);
    affinity += posture;
    evidence.push(
      `local posture delta=${Math.round(delta * 10) / 10} bias=${Math.round(posture)}`,
    );
  }

  if (source.regionId === target.regionId) {
    affinity += 5;
    evidence.push("shared region boost +5");
  }
  if (source.type === target.type) {
    affinity += 3;
    evidence.push("same market type boost +3");
  }

  affinity = clamp(affinity, -100, 100);
  const score = clampScore(Math.abs(affinity));

  let kind: CrossCorrelationKind = "NEUTRAL";
  if (score < 20) kind = "NEUTRAL";
  else if (affinity >= 20) kind = "POSITIVE";
  else if (affinity <= -20) kind = "NEGATIVE";

  return {
    sourceMarketId: source.id,
    targetMarketId: target.id,
    kind,
    score,
    affinity: Math.round(affinity * 10) / 10,
    evidence,
    signalCount: cross.length,
    detectedAt: nowIso(),
  };
}

function buildRecommendations(
  relationship: MarketRelationshipAnalysis,
  correlation: MarketCorrelation,
): string[] {
  const recommendations: string[] = [];

  if (correlation.kind === "INSUFFICIENT") {
    recommendations.push(
      "record cross-market signals before acting on correlation",
    );
    return recommendations;
  }

  if (correlation.kind === "POSITIVE") {
    recommendations.push(
      "coordinate ops across both markets — positive correlation detected",
    );
  } else if (correlation.kind === "NEGATIVE") {
    recommendations.push(
      "hedge exposure — markets move in opposing directions",
    );
  } else {
    recommendations.push("monitor pair; correlation remains neutral");
  }

  if (relationship.dominantRelation === "COMPETITIVE") {
    recommendations.push("differentiate positioning against competitive pair");
  }
  if (relationship.dominantRelation === "SUPPLY_CHAIN") {
    recommendations.push("align supply-chain capacity across the pair");
  }
  if (relationship.dominantRelation === "COMPLEMENTARY") {
    recommendations.push("bundle complementary market offers");
  }
  if (relationship.findings.some((f) => f.includes("SUSPENDED"))) {
    recommendations.push("restore suspended market before scaling cross ops");
  }

  return recommendations;
}

/** Build a cross-market insight snapshot for a market pair. */
export function buildCrossMarketInsight(
  sourceMarketId: string,
  targetMarketId: string,
  options?: { refresh?: boolean },
): CrossMarketInsight {
  const { source, target } = resolvePair(sourceMarketId, targetMarketId);
  const key = pairInsightKey(source.id, target.id);

  if (!options?.refresh) {
    const existing = insights.get(key);
    if (existing) return cloneInsight(existing);
  }

  const relationship = analyzeRelationship(source.id, target.id);
  const correlation = detectMarketCorrelation(source.id, target.id);
  const recommendations = buildRecommendations(relationship, correlation);

  const score = clampScore(
    correlation.score * 0.7 + relationship.avgStrength * 0.3,
  );
  const level = levelFromScore(score);

  const headline =
    correlation.kind === "INSUFFICIENT"
      ? `${source.code}↔${target.code}: insufficient cross-signal coverage`
      : `${source.code}↔${target.code}: ${correlation.kind.toLowerCase()} correlation (${level})`;

  const summary = [
    `pair=${source.id}|${target.id}`,
    `signals=${relationship.signalCount}`,
    `avgStrength=${relationship.avgStrength}`,
    `dominant=${relationship.dominantRelation ?? "none"}`,
    `correlation=${correlation.kind}`,
    `affinity=${correlation.affinity}`,
    `score=${score}`,
    `level=${level}`,
  ].join(" ");

  const insight: CrossMarketInsight = {
    id: createId("xmk-insight"),
    sourceMarketId: source.id,
    targetMarketId: target.id,
    level,
    score,
    correlation,
    relationship,
    headline,
    summary,
    recommendations,
    builtAt: nowIso(),
  };

  insights.set(key, insight);
  return cloneInsight(insight);
}

export function clearCrossMarketInsights(
  marketId?: Market["id"],
): void {
  if (!marketId) {
    insights.clear();
    return;
  }
  const id = marketId.trim();
  for (const [key, insight] of [...insights.entries()]) {
    if (
      insight.sourceMarketId === id ||
      insight.targetMarketId === id
    ) {
      insights.delete(key);
    }
  }
}

export function listCrossMarketInsights(): CrossMarketInsight[] {
  return [...insights.values()]
    .sort(
      (a, b) =>
        a.sourceMarketId.localeCompare(b.sourceMarketId) ||
        a.targetMarketId.localeCompare(b.targetMarketId),
    )
    .map(cloneInsight);
}
