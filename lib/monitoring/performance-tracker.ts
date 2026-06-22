/**
 * V59.5 — Performance measurement helpers
 */

import { recordDuration } from "@/lib/observability/metrics.service";

export type PerformanceSpan = {
  name: string;
  startedAt: number;
  tags?: Record<string, string>;
};

export function startPerformanceSpan(name: string, tags?: Record<string, string>): PerformanceSpan {
  return { name, startedAt: Date.now(), tags };
}

export function endPerformanceSpan(span: PerformanceSpan): number {
  const durationMs = Date.now() - span.startedAt;
  recordDuration(span.name, durationMs, span.tags);
  return durationMs;
}

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>,
): Promise<{ result: T; durationMs: number }> {
  const span = startPerformanceSpan(name, tags);
  const result = await fn();
  const durationMs = endPerformanceSpan(span);
  return { result, durationMs };
}
