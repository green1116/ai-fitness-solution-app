/**
 * Launch P7 — Executive Dashboard
 */

import { getLatestReleaseDecision } from "./control.decision";
import { aggregateDeploymentStatus } from "./control.deployment";
import { evaluateGoNoGo, getGoNoGoResult } from "./control.gonogo";
import { computeLaunchMetrics } from "./control.metrics";
import { getLaunchOrchestration } from "./control.orchestration";
import type { ExecutiveDashboard } from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildExecutiveDashboard(
  orchestrationId: string,
  options?: { refreshGoNoGo?: boolean },
): ExecutiveDashboard {
  const orchestration = getLaunchOrchestration(orchestrationId.trim());
  if (!orchestration) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const goNoGo =
    options?.refreshGoNoGo === false
      ? getGoNoGoResult(orchestration.id) ?? evaluateGoNoGo(orchestration.id)
      : evaluateGoNoGo(orchestration.id);

  const decision = getLatestReleaseDecision(orchestration.id);
  const deployment = aggregateDeploymentStatus(orchestration.id);
  const metrics = computeLaunchMetrics(orchestration.id);

  const domainScores = goNoGo.checks.map((c) => ({
    domain: c.domain,
    ready: c.ok,
    detail: c.detail,
  }));

  const headline = [
    `Launch Control: ${orchestration.name}`,
    `go/no-go=${goNoGo.verdict}`,
    `deployment=${deployment.aggregateStatus}`,
    `score=${metrics.readinessScore}%`,
  ].join(" | ");

  return {
    orchestrationId: orchestration.id,
    productId: orchestration.productId,
    orchestrationStatus: getLaunchOrchestration(orchestration.id)!.status,
    goNoGo: goNoGo.verdict,
    releaseDecision: decision?.verdict,
    deploymentStatus: deployment.aggregateStatus,
    domainScores,
    metrics,
    headline,
    generatedAt: nowIso(),
  };
}
