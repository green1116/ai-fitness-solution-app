/**
 * V60 P1 — Funnel analytics & GrowthMetrics aggregation
 */

import {
  createEmptyGrowthMetrics,
  type GrowthMetrics,
  type FunnelStage,
  FUNNEL_STAGE_EVENTS,
} from "./growth.funnel.model";
import { getGrowthEventsSnapshot } from "../growth.events.store";
import { computeActivationMetrics } from "../activation/activation.metrics";
import { computeRetentionRate } from "../retention/retention.metrics";
import { computeChurnRate, predictChurn } from "../retention/churn.predictor";

export type FunnelSnapshot = Record<FunnelStage, number>;

export function aggregateGrowthMetrics(): GrowthMetrics {
  const events = getGrowthEventsSnapshot();
  const activation = computeActivationMetrics();

  const visitors = events.filter(
    (e) => e.event === "visitor.landing" || e.event === "visitor.utm",
  ).length;
  const signups = events.filter((e) => e.event === "user.signup").length;
  const activatedUsers = new Set(
    events.filter((e) => e.event === "user.activation").map((e) => e.userId),
  ).size;
  const firstQuoteGenerated = events.filter(
    (e) =>
      e.event === "quote.generated" &&
      ((e.meta as { isFirst?: boolean } | undefined)?.isFirst === true ||
        (e.meta as { firstAction?: string } | undefined)?.firstAction === "quote"),
  ).length;
  const paidUsers = new Set(
    events.filter((e) => e.event === "payment.completed").map((e) => e.organizationId),
  ).size;

  const orgIds = [
    ...new Set(events.map((e) => e.organizationId).filter(Boolean) as string[]),
  ];

  return {
    visitors: Math.max(visitors, signups),
    signups: Math.max(signups, activation.signups),
    activatedUsers: Math.max(activatedUsers, activation.organizationsCreated),
    firstQuoteGenerated: Math.max(firstQuoteGenerated, activation.firstQuotes),
    paidUsers,
    churnRate: computeChurnRate(orgIds),
    retentionRate: computeRetentionRate(orgIds),
  };
}

export function buildFunnelSnapshot(): FunnelSnapshot {
  const events = getGrowthEventsSnapshot();
  const snapshot: FunnelSnapshot = {
    acquisition: 0,
    activation: 0,
    conversion: 0,
    retention: 0,
  };

  for (const [stage, stageEvents] of Object.entries(FUNNEL_STAGE_EVENTS) as [
    FunnelStage,
    (typeof FUNNEL_STAGE_EVENTS)[FunnelStage],
  ][]) {
    snapshot[stage] = events.filter((e) =>
      stageEvents.includes(e.event as (typeof stageEvents)[number]),
    ).length;
  }

  return snapshot;
}

export function buildGrowthDashboard() {
  const metrics = aggregateGrowthMetrics();
  const funnel = buildFunnelSnapshot();
  const orgIds = [
    ...new Set(
      getGrowthEventsSnapshot()
        .map((e) => e.organizationId)
        .filter(Boolean) as string[],
    ),
  ];
  const churnProfiles = orgIds.slice(0, 20).map((id) => predictChurn(id));

  return {
    metrics,
    funnel,
    churnProfiles,
    generatedAt: new Date().toISOString(),
  };
}

export { createEmptyGrowthMetrics, type GrowthMetrics, type FunnelStage };
