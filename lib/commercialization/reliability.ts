/**
 * V3.5 reliability runtime foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

export const RELIABILITY_FOUNDATION_VERSION = "3.5-reliability-1" as const;

export type ReliabilityFoundationInput = {
  deploymentId: string;
  failureCount?: number;
  latencyP95Ms?: number;
};

export type ReliabilityFoundationResult = {
  version: typeof RELIABILITY_FOUNDATION_VERSION;
  deploymentId: string;
  failureCount: number;
  latencyP95Ms: number;
  stable: boolean;
  summary: string;
};

export type RuntimeReliabilityProfile = {
  failureCount?: number;
  latencyP95Ms?: number;
  stable?: boolean;
};

/** Minimal reliability compat: derive stable flag from observability signals. */
export function runReliabilityFoundation(
  input: ReliabilityFoundationInput,
): ReliabilityFoundationResult {
  const failureCount = input.failureCount ?? 0;
  const latencyP95Ms = input.latencyP95Ms ?? 0;
  const stable = failureCount === 0;

  return {
    version: RELIABILITY_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    failureCount,
    latencyP95Ms,
    stable,
    summary: [
      `reliability=${RELIABILITY_FOUNDATION_VERSION}`,
      `failures=${failureCount}`,
      `p95Ms=${latencyP95Ms}`,
      `stable=${stable}`,
    ].join(" "),
  };
}

export function formatReliabilityRuntimeHook(
  result: ReliabilityFoundationResult,
): string {
  return result.summary;
}

export function buildReliabilitySummary(
  result: ReliabilityFoundationResult,
): string {
  return result.summary;
}

export function resetCircuitBreaker(name?: string): void {
  void name;
}
