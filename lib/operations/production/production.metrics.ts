/**
 * Post-Launch P1 — Production Metrics
 * Integrates SLA support response metrics + health signals
 */

import { computeSupportResponseMetrics } from "../../launch/support/support.metrics";
import { buildRuntimeHealthDashboard } from "./production.dashboard";
import { listOperationChecklists } from "./production.checklist";
import { getProductionOperation } from "./production.operation";
import { getLatestOperationalStatus } from "./production.status";
import type { ProductionMetrics } from "./production.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeProductionMetrics(
  productionOperationId: string,
): ProductionMetrics {
  const operation = getProductionOperation(productionOperationId.trim());
  if (!operation) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const latest = getLatestOperationalStatus(operation.id);
  const checklists = listOperationChecklists({
    productionOperationId: operation.id,
  });
  const checklistComplete =
    checklists.length >= 1 && checklists.every((c) => c.complete);

  const dashboard = buildRuntimeHealthDashboard(operation.id);

  let slaComplianceRate: number | null = null;
  let openIncidents = 0;
  if (operation.supportSlaProfileId) {
    try {
      const sla = computeSupportResponseMetrics(operation.supportSlaProfileId);
      slaComplianceRate = sla.slaComplianceRate;
      openIncidents = sla.openCount;
    } catch {
      slaComplianceRate = null;
      openIncidents = 0;
    }
  }

  let score = 0;
  if (dashboard.cloudOk) score += 25;
  if (dashboard.observabilityOk) score += 25;
  if (checklistComplete) score += 20;
  if (latest && (latest.level === "NOMINAL" || latest.level === "WATCH")) {
    score += 15;
  }
  if (operation.orchestrationId) score += 10;
  if (operation.supportSlaProfileId) score += 5;

  return {
    productionOperationId: operation.id,
    statusLevel: latest?.level ?? "UNKNOWN",
    checklistComplete,
    cloudHealthy: dashboard.cloudOk,
    observabilityHealthy: dashboard.observabilityOk,
    slaComplianceRate,
    openIncidents,
    readinessScore: score,
    computedAt: nowIso(),
  };
}
