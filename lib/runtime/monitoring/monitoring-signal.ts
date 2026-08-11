/**
 * RSO-2 — Monitoring signal contract
 * Projection vocabulary for ApplicationMonitoring.
 */

export const MONITORING_SIGNAL_LEVELS = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;
export type MonitoringSignalLevel =
  (typeof MONITORING_SIGNAL_LEVELS)[number];

export const APPLICATION_MONITORING_STATUSES = [
  "QUIET",
  "ATTENTION",
  "ALERT",
] as const;
export type ApplicationMonitoringStatus =
  (typeof APPLICATION_MONITORING_STATUSES)[number];

export type MonitoringSignal = Readonly<{
  signalId: string;
  sourceCheckId: string;
  level: MonitoringSignalLevel;
  summary: string;
  detail: string;
  ordinal: number;
}>;

/** Map runtime health status to a monitoring signal level. */
export function monitoringLevelFromHealthStatus(
  status: "UP" | "DEGRADED" | "DOWN",
): MonitoringSignalLevel {
  if (status === "UP") return "INFO";
  if (status === "DEGRADED") return "WARN";
  return "CRITICAL";
}

/** Aggregate signal levels into overall monitoring status. */
export function aggregateMonitoringStatus(
  levels: readonly MonitoringSignalLevel[],
): ApplicationMonitoringStatus {
  if (levels.length === 0) return "ALERT";
  if (levels.some((l) => l === "CRITICAL")) return "ALERT";
  if (levels.some((l) => l === "WARN")) return "ATTENTION";
  return "QUIET";
}
