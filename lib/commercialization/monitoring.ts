/**
 * V3.5 monitoring foundation compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const MONITORING_RUNTIME_VERSION = "3.5-monitoring-1" as const;

export type MonitoringFoundationInput = {
  deploymentId: string;
};

export type MonitoringFoundationResult = {
  version: typeof MONITORING_RUNTIME_VERSION;
  deploymentId: string;
  ready: boolean;
  summary: string;
};

export function runMonitoringFoundation(
  input: MonitoringFoundationInput,
): MonitoringFoundationResult {
  return {
    version: MONITORING_RUNTIME_VERSION,
    deploymentId: input.deploymentId,
    ready: true,
    summary: `monitoring=${MONITORING_RUNTIME_VERSION} deploymentId=${input.deploymentId} ready=true`,
  };
}

export function buildMonitoringSummary(
  result: MonitoringFoundationResult,
): string {
  return result.summary;
}
