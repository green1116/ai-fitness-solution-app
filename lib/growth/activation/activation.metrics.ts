/**
 * V60 P1 — Activation metrics
 */

import { getGrowthEventsSnapshot } from "../growth.events.store";
import type { GrowthMetrics } from "../funnel/growth.funnel.model";

export type ActivationMetrics = {
  signups: number;
  organizationsCreated: number;
  firstProjects: number;
  firstQuotes: number;
  activationRate: number;
};

export function computeActivationMetrics(): ActivationMetrics {
  const events = getGrowthEventsSnapshot();
  const signups = events.filter((e) => e.event === "user.signup").length;
  const organizationsCreated = new Set(
    events.filter((e) => e.event === "user.activation").map((e) => e.organizationId),
  ).size;
  const firstProjects = events.filter(
    (e) => e.event === "project.created" && (e.meta as { isFirst?: boolean })?.isFirst,
  ).length;
  const firstQuotes = events.filter(
    (e) => e.event === "quote.generated" && (e.meta as { isFirst?: boolean })?.isFirst,
  ).length;
  const activatedUsers = new Set(
    events.filter((e) => e.event === "user.activation").map((e) => e.userId),
  ).size;

  const activationRate = signups > 0 ? Math.round((activatedUsers / signups) * 100) : 0;

  return {
    signups,
    organizationsCreated,
    firstProjects,
    firstQuotes,
    activationRate,
  };
}

export function mergeActivationIntoGrowthMetrics(base: GrowthMetrics): GrowthMetrics {
  const activation = computeActivationMetrics();
  return {
    ...base,
    signups: Math.max(base.signups, activation.signups),
    activatedUsers: Math.max(base.activatedUsers, activation.activationRate > 0 ? activation.signups : 0),
    firstQuoteGenerated: Math.max(base.firstQuoteGenerated, activation.firstQuotes),
  };
}
