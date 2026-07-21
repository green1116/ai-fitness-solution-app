/**
 * E11-P7 — Compliance State
 * Assesses tenant isolation, governance, observability, autonomous posture
 */

import { listOperations } from "../autonomous/autonomous.operation";
import { listIncidents } from "../autonomous/autonomous.incident";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { listAnomalies } from "../observability/observability.anomaly";
import { captureObservabilityMetrics } from "../observability/observability.metrics";
import { listRuntimes } from "../registry/cloud.registry";
import { checkAllRuntimeHealth } from "../runtime/cloud.health";
import { listTenants } from "../tenant/tenant.namespace";
import { getIsolationPolicyByTenant } from "../tenant/tenant.policy";
import type {
  ComplianceFinding,
  ComplianceState,
  ComplianceStateReport,
} from "./control-plane.types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function worstState(states: ComplianceState[]): ComplianceState {
  if (states.includes("NON_COMPLIANT")) return "NON_COMPLIANT";
  if (states.includes("WARNING")) return "WARNING";
  if (states.includes("UNKNOWN")) return "UNKNOWN";
  return "COMPLIANT";
}

export function assessCompliance(options?: {
  tenantId?: string;
}): ComplianceStateReport {
  const findings: ComplianceFinding[] = [];
  const tenantId = options?.tenantId?.trim();

  const tenants = tenantId
    ? listTenants().filter((t) => t.id === tenantId)
    : listTenants();

  for (const tenant of tenants) {
    const isolation = getIsolationPolicyByTenant(tenant.id);
    if (!isolation) {
      findings.push({
        id: createId("cf"),
        state: "WARNING",
        category: "ISOLATION",
        message: `tenant ${tenant.id} missing isolation policy`,
        tenantId: tenant.id,
        evidence: { tenantStatus: tenant.status },
        detectedAt: nowIso(),
      });
    } else if (isolation.mode === "PERMISSIVE") {
      findings.push({
        id: createId("cf"),
        state: "WARNING",
        category: "ISOLATION",
        message: `tenant ${tenant.id} uses PERMISSIVE isolation`,
        tenantId: tenant.id,
        evidence: { mode: isolation.mode },
        detectedAt: nowIso(),
      });
    }
  }

  const gov = captureGovernanceMetrics();
  if (gov.deniedAllocations > 0) {
    findings.push({
      id: createId("cf"),
      state: "WARNING",
      category: "GOVERNANCE",
      message: `denied allocations=${gov.deniedAllocations}`,
      evidence: { deniedAllocations: gov.deniedAllocations },
      detectedAt: nowIso(),
    });
  }
  if (gov.averageUtilization >= 0.95) {
    findings.push({
      id: createId("cf"),
      state: "NON_COMPLIANT",
      category: "GOVERNANCE",
      message: `utilization critical ${gov.averageUtilization.toFixed(2)}`,
      evidence: { utilization: gov.averageUtilization },
      detectedAt: nowIso(),
    });
  }

  const obs = captureObservabilityMetrics();
  if (!obs.healthOk) {
    findings.push({
      id: createId("cf"),
      state: "NON_COMPLIANT",
      category: "OBSERVABILITY",
      message: `health not ok level=${obs.healthLevel}`,
      evidence: { healthLevel: obs.healthLevel },
      detectedAt: nowIso(),
    });
  }
  if (obs.errorEventCount > 0) {
    findings.push({
      id: createId("cf"),
      state: "WARNING",
      category: "OBSERVABILITY",
      message: `error events=${obs.errorEventCount}`,
      evidence: { errorEventCount: obs.errorEventCount },
      detectedAt: nowIso(),
    });
  }

  const anomalies = listAnomalies(
    tenantId ? { tenantId } : undefined,
  ).filter((a) => a.score >= 0.7);
  for (const anomaly of anomalies) {
    findings.push({
      id: createId("cf"),
      state: anomaly.score >= 0.9 ? "NON_COMPLIANT" : "WARNING",
      category: "ANOMALY",
      message: anomaly.message,
      tenantId: anomaly.tenantId,
      runtimeId: anomaly.runtimeId,
      evidence: { kind: anomaly.kind, score: anomaly.score },
      detectedAt: nowIso(),
    });
  }

  const openIncidents = listIncidents({ status: "OPEN" }).filter((i) =>
    tenantId ? i.tenantId === tenantId : true,
  );
  if (openIncidents.length > 0) {
    findings.push({
      id: createId("cf"),
      state: "WARNING",
      category: "AUTONOMOUS",
      message: `open incidents=${openIncidents.length}`,
      tenantId,
      evidence: { openIncidents: openIncidents.length },
      detectedAt: nowIso(),
    });
  }

  const unhealthy = checkAllRuntimeHealth().filter(
    (h) => !h.ok || h.level === "UNHEALTHY",
  );
  for (const report of unhealthy) {
    findings.push({
      id: createId("cf"),
      state: "NON_COMPLIANT",
      category: "RUNTIME",
      message: `runtime unhealthy ${report.runtimeId}`,
      runtimeId: report.runtimeId,
      evidence: { level: report.level },
      detectedAt: nowIso(),
    });
  }

  if (listRuntimes().length === 0) {
    findings.push({
      id: createId("cf"),
      state: "UNKNOWN",
      category: "RUNTIME",
      message: "no runtimes registered",
      evidence: {},
      detectedAt: nowIso(),
    });
  }

  const pendingOps = listOperations().filter((o) => o.status === "PENDING");
  if (pendingOps.length > 0) {
    findings.push({
      id: createId("cf"),
      state: "WARNING",
      category: "AUTONOMOUS",
      message: `pending autonomous operations=${pendingOps.length}`,
      tenantId,
      evidence: { pendingOperations: pendingOps.length },
      detectedAt: nowIso(),
    });
  }

  const compliantCount = findings.filter((f) => f.state === "COMPLIANT").length;
  const warningCount = findings.filter((f) => f.state === "WARNING").length;
  const nonCompliantCount = findings.filter(
    (f) => f.state === "NON_COMPLIANT",
  ).length;

  const overall =
    findings.length === 0
      ? "COMPLIANT"
      : worstState(findings.map((f) => f.state));

  return {
    overall,
    compliantCount,
    warningCount,
    nonCompliantCount,
    findings,
    assessedAt: nowIso(),
  };
}

export function captureComplianceState(options?: {
  tenantId?: string;
}): ComplianceStateReport {
  return assessCompliance(options);
}
