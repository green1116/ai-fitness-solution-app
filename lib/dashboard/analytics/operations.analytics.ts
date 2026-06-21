/**
 * V61 P2 — Operations analytics (V59.5 observability + runtime health)
 */

import { getMetricSnapshot } from "@/lib/observability/metrics.service";
import { resolveDeploymentEnvironment } from "@/lib/expansion/deployment/environment.manager";

export function analyzeOperations() {
  const snapshot = getMetricSnapshot();
  const apiRequests = Object.entries(snapshot.counters)
    .filter(([k]) => k.startsWith("api.requests"))
    .reduce((sum, [, v]) => sum + v, 0);

  const apiErrors = Object.entries(snapshot.counters)
    .filter(([k]) => k.startsWith("api.errors"))
    .reduce((sum, [, v]) => sum + v, 0);

  const errorRate = apiRequests > 0 ? Math.round((apiErrors / apiRequests) * 100) : 0;

  const durations = Object.values(snapshot.histograms);
  const avgLatency =
    durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d.avgMs, 0) / durations.length)
      : 0;

  return {
    environment: resolveDeploymentEnvironment(),
    health: errorRate < 5 ? "healthy" : errorRate < 15 ? "degraded" : "critical",
    apiRequests,
    apiErrors,
    errorRate,
    avgLatencyMs: avgLatency,
    metrics: snapshot,
  };
}
