/**
 * E11-P5 — Anomaly Detector
 */

import { listExecutionTraces } from "../execution/execution.trace";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { getTenantQuotaByType } from "../tenant/tenant.quota";
import { listTenants } from "../tenant/tenant.namespace";
import { emitEvent } from "./observability.event";
import { aggregateObservabilityHealth } from "./observability.health";
import type { AnomalyKind, AnomalyReport } from "./observability.types";

const anomalies: AnomalyReport[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnomaly(a: AnomalyReport): AnomalyReport {
  return { ...a, evidence: { ...a.evidence } };
}

function pushAnomaly(input: {
  kind: AnomalyKind;
  severity: AnomalyReport["severity"];
  message: string;
  score: number;
  runtimeId?: string;
  tenantId?: string;
  evidence?: Record<string, unknown>;
}): AnomalyReport {
  const report: AnomalyReport = {
    id: createId("anom"),
    kind: input.kind,
    severity: input.severity,
    message: input.message,
    score: input.score,
    runtimeId: input.runtimeId,
    tenantId: input.tenantId,
    evidence: { ...(input.evidence ?? {}) },
    detectedAt: nowIso(),
  };
  anomalies.push(report);
  emitEvent({
    kind: "ANOMALY",
    severity: input.severity,
    message: input.message,
    runtimeId: input.runtimeId,
    tenantId: input.tenantId,
    source: "observability.anomaly",
    payload: { anomalyId: report.id, kind: input.kind, score: input.score },
  });
  return cloneAnomaly(report);
}

/** Scan current platform signals for anomalies. */
export function detectAnomalies(options?: {
  utilizationThreshold?: number;
  failureSpikeMin?: number;
  quotaPressureRatio?: number;
}): AnomalyReport[] {
  const utilizationThreshold = options?.utilizationThreshold ?? 0.85;
  const failureSpikeMin = options?.failureSpikeMin ?? 2;
  const quotaPressureRatio = options?.quotaPressureRatio ?? 0.9;
  const found: AnomalyReport[] = [];

  const health = aggregateObservabilityHealth();
  if (!health.ok) {
    found.push(
      pushAnomaly({
        kind: "HEALTH_DEGRADED",
        severity: health.level === "UNHEALTHY" ? "ERROR" : "WARN",
        message: `aggregated health ${health.level}`,
        score: health.level === "UNHEALTHY" ? 0.9 : 0.6,
        evidence: {
          healthyCount: health.healthyCount,
          degradedCount: health.degradedCount,
          unhealthyCount: health.unhealthyCount,
        },
      }),
    );
  }

  const gov = captureGovernanceMetrics();
  if (gov.averageUtilization >= utilizationThreshold) {
    found.push(
      pushAnomaly({
        kind: "HIGH_UTILIZATION",
        severity: gov.averageUtilization >= 0.95 ? "CRITICAL" : "WARN",
        message: `governance utilization ${gov.averageUtilization.toFixed(2)}`,
        score: Math.min(1, gov.averageUtilization),
        evidence: {
          averageUtilization: gov.averageUtilization,
          totalAllocated: gov.totalAllocated,
          totalCapacity: gov.totalCapacity,
        },
      }),
    );
  }

  const traces = listExecutionTraces();
  let failedEvents = 0;
  for (const trace of traces) {
    failedEvents += trace.events.filter((e) => e.type === "failed").length;
  }
  if (failedEvents >= failureSpikeMin) {
    found.push(
      pushAnomaly({
        kind: "EXECUTION_FAILURE_SPIKE",
        severity: "ERROR",
        message: `execution failure spike count=${failedEvents}`,
        score: Math.min(1, failedEvents / 10),
        evidence: { failedEvents, traceCount: traces.length },
      }),
    );
  }

  for (const tenant of listTenants({ status: "ACTIVE" })) {
    const quota = getTenantQuotaByType(tenant.id, "TASK");
    if (!quota || quota.limit <= 0) continue;
    const ratio = quota.used / quota.limit;
    if (ratio >= quotaPressureRatio) {
      found.push(
        pushAnomaly({
          kind: "QUOTA_PRESSURE",
          severity: ratio >= 1 ? "CRITICAL" : "WARN",
          message: `tenant ${tenant.id} TASK quota pressure ${ratio.toFixed(2)}`,
          score: Math.min(1, ratio),
          tenantId: tenant.id,
          evidence: { used: quota.used, limit: quota.limit, ratio },
        }),
      );
    }
  }

  return found;
}

export function listAnomalies(filter?: {
  kind?: AnomalyKind;
  tenantId?: string;
}): AnomalyReport[] {
  let result = [...anomalies];
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((a) => a.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.detectedAt.localeCompare(b.detectedAt))
    .map(cloneAnomaly);
}

export function clearAnomalies(): void {
  anomalies.length = 0;
}

export function anomalyCount(): number {
  return anomalies.length;
}
