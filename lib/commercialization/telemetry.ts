/**
 * V3.5 telemetry foundation compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const TELEMETRY_RUNTIME_VERSION = "3.5-telemetry-1" as const;

export type TelemetryFoundationInput = {
  deploymentId: string;
};

export type TelemetryFoundationResult = {
  version: typeof TELEMETRY_RUNTIME_VERSION;
  deploymentId: string;
  ready: boolean;
  summary: string;
};

export function runTelemetryFoundation(
  input: TelemetryFoundationInput,
): TelemetryFoundationResult {
  return {
    version: TELEMETRY_RUNTIME_VERSION,
    deploymentId: input.deploymentId,
    ready: true,
    summary: `telemetry=${TELEMETRY_RUNTIME_VERSION} deploymentId=${input.deploymentId} ready=true`,
  };
}

export function buildTelemetrySummary(
  result: TelemetryFoundationResult,
): string {
  return result.summary;
}
