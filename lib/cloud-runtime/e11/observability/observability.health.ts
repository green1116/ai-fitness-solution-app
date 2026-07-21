/**
 * E11-P5 — Health Aggregation
 * Aggregates runtime health + governance utilization
 */

import { captureGovernanceMetrics } from "../governance/governance.metrics";
import {
  checkAllRuntimeHealth,
  checkRuntimeHealth,
} from "../runtime/cloud.health";
import { getRuntimeLifecycle } from "../runtime/cloud.lifecycle";
import type { AggregatedHealthReport, CloudHealthLevel } from "./observability.types";

function nowIso(): string {
  return new Date().toISOString();
}

function rollupLevel(levels: CloudHealthLevel[]): CloudHealthLevel {
  if (levels.length === 0) return "UNKNOWN";
  if (levels.includes("UNHEALTHY")) return "UNHEALTHY";
  if (levels.includes("DEGRADED") || levels.includes("UNKNOWN")) {
    return "DEGRADED";
  }
  return "HEALTHY";
}

export function aggregateObservabilityHealth(): AggregatedHealthReport {
  const reports = checkAllRuntimeHealth();
  let healthyCount = 0;
  let degradedCount = 0;
  let unhealthyCount = 0;

  const summary = reports.map((r) => {
    if (r.level === "HEALTHY") healthyCount += 1;
    else if (r.level === "DEGRADED") degradedCount += 1;
    else if (r.level === "UNHEALTHY") unhealthyCount += 1;

    // Enrich with lifecycle stage when available
    const lifecycle = getRuntimeLifecycle(r.runtimeId);
    return {
      runtimeId: r.runtimeId,
      level: r.level,
      ok: r.ok,
      ...(lifecycle ? { lifecycle: lifecycle.current } : {}),
    };
  });

  const gov = captureGovernanceMetrics();
  // High utilization degrades overall health signal
  let level = rollupLevel(reports.map((r) => r.level));
  if (gov.averageUtilization >= 0.9 && level === "HEALTHY") {
    level = "DEGRADED";
  }

  return {
    level,
    ok: level === "HEALTHY",
    runtimeCount: reports.length,
    healthyCount,
    degradedCount,
    unhealthyCount,
    governanceUtilization: gov.averageUtilization,
    reports: summary.map((s) => ({
      runtimeId: s.runtimeId,
      level: s.level,
      ok: s.ok,
    })),
    checkedAt: nowIso(),
  };
}

export function getRuntimeHealthDetail(runtimeId: string) {
  return checkRuntimeHealth(runtimeId);
}
