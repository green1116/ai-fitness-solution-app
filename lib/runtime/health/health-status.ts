/**
 * RSO-1 — Runtime health status contract
 * Shared status / check result enums for RuntimeHealth.
 */

export const RUNTIME_HEALTH_STATUSES = ["UP", "DEGRADED", "DOWN"] as const;
export type RuntimeHealthStatus = (typeof RUNTIME_HEALTH_STATUSES)[number];

export const HEALTH_CHECK_RESULTS = ["PASS", "FAIL", "SKIP"] as const;
export type HealthCheckResult = (typeof HEALTH_CHECK_RESULTS)[number];

export const HEALTH_CHECK_IDS = [
  "BASELINE_BOUND",
  "GA_BASELINE_LOCK",
  "SURFACE_DECLARED",
  "NO_LIVE_PROBES",
] as const;
export type HealthCheckId = (typeof HEALTH_CHECK_IDS)[number];

/** Map a check result to a local health status signal. */
export function healthStatusFromResult(
  result: HealthCheckResult,
): RuntimeHealthStatus {
  if (result === "PASS") return "UP";
  if (result === "FAIL") return "DOWN";
  return "DEGRADED";
}

/** Aggregate check results into overall RuntimeHealth status. */
export function aggregateRuntimeHealthStatus(
  results: readonly HealthCheckResult[],
): RuntimeHealthStatus {
  if (results.length === 0) return "DOWN";
  if (results.every((r) => r === "PASS")) return "UP";
  if (results.some((r) => r === "FAIL")) return "DOWN";
  return "DEGRADED";
}
