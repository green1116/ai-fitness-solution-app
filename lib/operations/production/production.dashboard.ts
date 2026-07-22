/**
 * Post-Launch P1 — Runtime Health Dashboard
 * Integrates cloud runtime health + observability
 */

import { aggregateObservabilityHealth } from "../../cloud-runtime/e11/observability/observability.health";
import {
  aggregateCloudHealth,
  checkAllRuntimeHealth,
  checkRuntimeHealth,
} from "../../cloud-runtime/e11/runtime/cloud.health";
import { getProductionOperation } from "./production.operation";
import type { RuntimeHealthDashboard } from "./production.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildRuntimeHealthDashboard(
  productionOperationId: string,
): RuntimeHealthDashboard {
  const operation = getProductionOperation(productionOperationId.trim());
  if (!operation) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const reports = operation.cloudRuntimeId
    ? [checkRuntimeHealth(operation.cloudRuntimeId)]
    : checkAllRuntimeHealth();
  const cloud = aggregateCloudHealth(reports);
  const observability = aggregateObservabilityHealth();

  const headline = [
    `Ops Health: ${operation.name}`,
    `cloud=${cloud.level}`,
    `obs=${observability.level}`,
    `runtimes=${cloud.healthyCount}/${reports.length}`,
  ].join(" | ");

  return {
    productionOperationId: operation.id,
    cloudLevel: cloud.level,
    cloudOk: cloud.ok,
    observabilityLevel: observability.level,
    observabilityOk: observability.ok,
    runtimeCount: reports.length,
    healthyCount: cloud.healthyCount,
    degradedCount: cloud.degradedCount,
    unhealthyCount: cloud.unhealthyCount,
    headline,
    generatedAt: nowIso(),
  };
}
