/** V80 CODE P4 — Observability (logs, metrics, traces, p95/p99, correlation) */
import { logInfo } from "@/lib/observability/logger";
import { incrementMetric, recordDuration } from "@/lib/observability/metrics.service";

const v80Histograms = new Map<string, number[]>();
const HIST_MAX = 500;

function histKey(endpoint: string) {
  return `v80:${endpoint}`;
}

function pushDuration(endpoint: string, ms: number) {
  const key = histKey(endpoint);
  const arr = v80Histograms.get(key) ?? [];
  arr.push(ms);
  if (arr.length > HIST_MAX) arr.shift();
  v80Histograms.set(key, arr);
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Math.round(sorted[idx] ?? 0);
}

export function recordV80Request(input: {
  endpoint: string;
  traceId: string;
  correlationId: string;
  durationMs: number;
  status: number;
  organizationId?: string;
  plan?: string;
}) {
  incrementMetric("v80.api.requests", {
    endpoint: input.endpoint,
    status: input.status,
    plan: input.plan,
  });
  recordDuration("v80.api.duration_ms", input.durationMs, { endpoint: input.endpoint });
  pushDuration(input.endpoint, input.durationMs);

  logInfo("v80.api.request", {
    traceId: input.traceId,
    organizationId: input.organizationId,
    meta: {
      correlationId: input.correlationId,
      endpoint: input.endpoint,
      status: input.status,
      durationMs: input.durationMs,
      plan: input.plan,
    },
  });
}

export function recordV80WorkflowStep(input: {
  traceId: string;
  projectId: string;
  step: string;
  durationMs: number;
  status: "completed" | "failed";
}) {
  incrementMetric("v80.workflow.step", { step: input.step, status: input.status });
  recordDuration("v80.workflow.step_ms", input.durationMs, { step: input.step });
}

export function recordV80PdfRender(input: {
  traceId: string;
  artifactType: string;
  durationMs: number;
  bytes: number;
}) {
  incrementMetric("v80.pdf.render", { type: input.artifactType });
  recordDuration("v80.pdf.render_ms", input.durationMs, { type: input.artifactType });
  logInfo("v80.pdf.render", {
    traceId: input.traceId,
    meta: { type: input.artifactType, durationMs: input.durationMs, bytes: input.bytes },
  });
}

export function getV80MetricsSnapshot() {
  const endpoints: Record<
    string,
    { count: number; avgMs: number; p50: number; p95: number; p99: number; maxMs: number }
  > = {};

  for (const [key, values] of v80Histograms) {
    const endpoint = key.replace(/^v80:/, "");
    const sum = values.reduce((a, b) => a + b, 0);
    endpoints[endpoint] = {
      count: values.length,
      avgMs: values.length ? Math.round(sum / values.length) : 0,
      p50: percentile(values, 50),
      p95: percentile(values, 95),
      p99: percentile(values, 99),
      maxMs: values.length ? Math.max(...values) : 0,
    };
  }

  return { version: "v80-obs-1", endpoints, capturedAt: new Date().toISOString() };
}

export function resetV80MetricsForTests() {
  v80Histograms.clear();
}

export function newCorrelationId(traceId: string) {
  return `v80corr-${traceId.slice(0, 8)}`;
}
