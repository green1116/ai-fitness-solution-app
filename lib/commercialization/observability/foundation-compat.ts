/**
 * V3.5 observability runtime foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

export const OBSERVABILITY_FOUNDATION_VERSION = "3.5-observability-1" as const;

export type ObservabilityFoundationInput = {
  deploymentId: string;
  traceId?: string;
  lastRunMs?: number;
};

export type ObservabilityFoundationResult = {
  version: typeof OBSERVABILITY_FOUNDATION_VERSION;
  deploymentId: string;
  traceId: string;
  lastRunMs: number;
  ready: boolean;
  summary: string;
  monitoring: {
    failures: {
      totalFailures: number;
    };
    latency: {
      p95Ms: number;
    };
  };
};

export type RuntimeObservabilityProfile = Pick<
  ObservabilityFoundationResult,
  "traceId" | "lastRunMs" | "ready" | "monitoring"
>;

/** Minimal observability compat: stable monitoring snapshot for reliability layer. */
export function runObservabilityFoundation(
  input: ObservabilityFoundationInput,
): ObservabilityFoundationResult {
  const traceId = input.traceId ?? `trace-${input.deploymentId}`;
  const lastRunMs = input.lastRunMs ?? 0;

  return {
    version: OBSERVABILITY_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    traceId,
    lastRunMs,
    ready: true,
    summary: `observability=${OBSERVABILITY_FOUNDATION_VERSION} traceId=${traceId} ready=true`,
    monitoring: {
      failures: { totalFailures: 0 },
      latency: { p95Ms: lastRunMs },
    },
  };
}

export function formatObservabilityRuntimeHook(
  result: ObservabilityFoundationResult,
): string {
  return result.summary;
}

export function buildObservabilitySummary(
  result: ObservabilityFoundationResult,
): string {
  return result.summary;
}

export function buildObservabilityProfile(input?: {
  deploymentId?: string;
  traceId?: string;
  lastRunMs?: number;
}) {
  const foundation = runObservabilityFoundation({
    deploymentId: input?.deploymentId ?? "default",
    traceId: input?.traceId,
    lastRunMs: input?.lastRunMs,
  });

  return {
    traceId: foundation.traceId,
    lastRunMs: foundation.lastRunMs,
    ready: foundation.ready,
    monitoring: foundation.monitoring,
  };
}
