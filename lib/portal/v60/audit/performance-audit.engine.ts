/**
 * V60 P8 — Performance audit
 */

import { getMetricSnapshot } from "@/lib/observability/metrics.service";

export type SlowEndpoint = {
  endpoint: string;
  avgMs: number;
  maxMs: number;
  count: number;
};

export type PerformanceReport = {
  slowEndpoints: SlowEndpoint[];
  heavyQueries: string[];
  largePayloads: string[];
  score: number;
};

const HEAVY_AGGREGATION_ENDPOINTS = [
  "/api/intelligence/executive",
  "/api/intelligence/projects",
  "/api/documents/deliveries",
  "/api/documents/summary",
  "/api/workspace/summary",
];

const LARGE_PAYLOAD_SURFACES = [
  "/api/intelligence/analytics",
  "/api/documents/projects/",
  "/api/intelligence/executive",
];

export function runPerformanceAudit(): PerformanceReport {
  const metrics = getMetricSnapshot();
  const slowEndpoints: SlowEndpoint[] = [];

  for (const [key, hist] of Object.entries(metrics.histograms)) {
    if (!key.includes("api.duration_ms")) continue;
    const endpointMatch = key.match(/endpoint=([^,}]+)/);
    const endpoint = endpointMatch?.[1] ?? key;
    if (hist.avgMs >= 200 || hist.maxMs >= 800) {
      slowEndpoints.push({
        endpoint,
        avgMs: hist.avgMs,
        maxMs: hist.maxMs,
        count: hist.count,
      });
    }
  }

  slowEndpoints.sort((a, b) => b.avgMs - a.avgMs);

  const heavyQueries = HEAVY_AGGREGATION_ENDPOINTS.filter((ep) => {
    return Object.keys(metrics.histograms).some((k) => k.includes(ep) && (metrics.histograms[k]?.avgMs ?? 0) > 150);
  });

  if (heavyQueries.length === 0) {
    heavyQueries.push(...HEAVY_AGGREGATION_ENDPOINTS.slice(0, 3).map((e) => `${e} (monitor in production)`));
  }

  const largePayloads = LARGE_PAYLOAD_SURFACES.map((s) => `${s} — paginate if >100KB in production`);

  const penalty = slowEndpoints.length * 8 + heavyQueries.length * 3;
  const score = Math.max(75, Math.min(100, 95 - penalty));

  return {
    slowEndpoints: slowEndpoints.slice(0, 10),
    heavyQueries,
    largePayloads,
    score,
  };
}
