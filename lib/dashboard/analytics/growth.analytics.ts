/**
 * V61 P2 — Growth analytics (V60 P1 Growth System)
 */

import {
  aggregateGrowthMetrics,
  buildFunnelSnapshot,
  buildGrowthDashboard,
} from "@/lib/growth/funnel/funnel.analytics";

export function analyzeGrowth() {
  const metrics = aggregateGrowthMetrics();
  const funnel = buildFunnelSnapshot();
  const dashboard = buildGrowthDashboard();

  const activationRate =
    metrics.signups > 0 ? Math.round((metrics.activatedUsers / metrics.signups) * 100) : 0;

  const visitorToSignup =
    metrics.visitors > 0 ? Math.round((metrics.signups / metrics.visitors) * 100) : 0;

  return {
    metrics,
    funnel,
    activationRate,
    visitorToSignup,
    trends: {
      signups: metrics.signups,
      activated: metrics.activatedUsers,
      paid: metrics.paidUsers,
      retention: metrics.retentionRate,
    },
    churnProfiles: dashboard.churnProfiles,
    generatedAt: dashboard.generatedAt,
  };
}
