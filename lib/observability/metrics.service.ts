/**
 * V59.5 — Lightweight in-process metrics (stateless-friendly counters)
 */

type MetricTags = Record<string, string | number | boolean | undefined>;

const counters = new Map<string, number>();
const histograms = new Map<string, number[]>();

function metricKey(name: string, tags?: MetricTags): string {
  if (!tags || Object.keys(tags).length === 0) return name;
  const parts = Object.entries(tags)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return `${name}{${parts.join(",")}}`;
}

export function incrementMetric(name: string, tags?: MetricTags, delta = 1): void {
  const key = metricKey(name, tags);
  counters.set(key, (counters.get(key) ?? 0) + delta);
}

export function recordDuration(name: string, durationMs: number, tags?: MetricTags): void {
  const key = metricKey(name, tags);
  const arr = histograms.get(key) ?? [];
  arr.push(durationMs);
  if (arr.length > 200) arr.shift();
  histograms.set(key, arr);
}

export function getMetricSnapshot(): {
  counters: Record<string, number>;
  histograms: Record<string, { count: number; avgMs: number; maxMs: number }>;
} {
  const counterOut: Record<string, number> = {};
  for (const [k, v] of counters) counterOut[k] = v;

  const histOut: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
  for (const [k, values] of histograms) {
    if (values.length === 0) continue;
    const sum = values.reduce((a, b) => a + b, 0);
    histOut[k] = {
      count: values.length,
      avgMs: Math.round(sum / values.length),
      maxMs: Math.max(...values),
    };
  }

  return { counters: counterOut, histograms: histOut };
}

export function resetMetricsForTests(): void {
  counters.clear();
  histograms.clear();
}

export function trackApiRequest(input: {
  endpoint: string;
  status: number;
  durationMs: number;
  plan?: string;
}): void {
  incrementMetric("api.requests", { endpoint: input.endpoint, status: input.status, plan: input.plan });
  recordDuration("api.duration_ms", input.durationMs, { endpoint: input.endpoint });
}

export function trackApiError(input: { endpoint: string; code: string }): void {
  incrementMetric("api.errors", { endpoint: input.endpoint, code: input.code });
}

export function trackUsageInsight(input: { organizationId: string; feature: string }): void {
  incrementMetric("usage.insights", { feature: input.feature, org: input.organizationId.slice(0, 8) });
}
