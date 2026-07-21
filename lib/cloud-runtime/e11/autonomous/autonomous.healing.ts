/**
 * E11-P6 — Self Healing
 * Heal from anomalies / unhealthy runtimes via recovery + incident linkage
 */

import { listAnomalies } from "../observability/observability.anomaly";
import { checkAllRuntimeHealth } from "../runtime/cloud.health";
import {
  attachOperationToIncident,
  openIncident,
  setIncidentStatus,
} from "./autonomous.incident";
import { createOperation, updateOperation } from "./autonomous.operation";
import { recoverRuntime } from "./autonomous.recovery";
import type { HealResult } from "./autonomous.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function selfHeal(options?: {
  tenantId?: string;
  openIncidents?: boolean;
}): HealResult {
  const op = createOperation({
    kind: "HEAL",
    title: "Self heal sweep",
    tenantId: options?.tenantId,
  });
  updateOperation(op.id, { status: "RUNNING", startedAt: nowIso() });

  const actions: string[] = [];
  const openIncidents = options?.openIncidents !== false;

  try {
    const healthReports = checkAllRuntimeHealth().filter(
      (r) => !r.ok || r.level === "DEGRADED" || r.level === "UNHEALTHY",
    );

    for (const report of healthReports) {
      const recovery = recoverRuntime({
        runtimeId: report.runtimeId,
        tenantId: options?.tenantId,
      });
      actions.push(
        `recover:${report.runtimeId}:${recovery.recovered ? "ok" : "fail"}`,
      );

      if (openIncidents && !recovery.recovered) {
        const incident = openIncident({
          title: `Heal failed for ${report.runtimeId}`,
          severity: report.level === "UNHEALTHY" ? "HIGH" : "MEDIUM",
          runtimeId: report.runtimeId,
          tenantId: options?.tenantId,
        });
        attachOperationToIncident(incident.id, recovery.operationId);
        setIncidentStatus(incident.id, "MITIGATING");
        actions.push(`incident:${incident.id}`);
      }
    }

    const anomalies = listAnomalies(
      options?.tenantId ? { tenantId: options.tenantId } : undefined,
    ).filter((a) => a.score >= 0.6);

    for (const anomaly of anomalies) {
      if (anomaly.runtimeId) {
        const recovery = recoverRuntime({
          runtimeId: anomaly.runtimeId,
          tenantId: anomaly.tenantId ?? options?.tenantId,
          anomalyId: anomaly.id,
        });
        actions.push(`anomaly-recover:${anomaly.id}:${recovery.recovered}`);
      } else if (openIncidents) {
        const incident = openIncident({
          title: `Anomaly ${anomaly.kind}`,
          severity: anomaly.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
          anomalyId: anomaly.id,
          tenantId: anomaly.tenantId ?? options?.tenantId,
          metadata: { score: anomaly.score },
        });
        attachOperationToIncident(incident.id, op.id);
        actions.push(`anomaly-incident:${incident.id}`);
      }
    }

    const healed = actions.some((a) => a.includes(":ok"));
    updateOperation(op.id, {
      status: "SUCCEEDED",
      finishedAt: nowIso(),
      result: `actions=${actions.length}`,
    });

    return {
      operationId: op.id,
      healed: healed || actions.length === 0,
      actions,
      message:
        actions.length === 0
          ? "nothing to heal"
          : `heal sweep completed actions=${actions.length}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "heal failed";
    updateOperation(op.id, {
      status: "FAILED",
      finishedAt: nowIso(),
      error: message,
    });
    return {
      operationId: op.id,
      healed: false,
      actions,
      message,
    };
  }
}
