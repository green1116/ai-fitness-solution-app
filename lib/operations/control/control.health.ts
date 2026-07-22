/**
 * Post-Launch P7 — Health Aggregation
 */

import { getCustomerHealthProfile } from "../customer-success/success.health";
import { getGrowthDashboard } from "../growth/growth.dashboard";
import { computeIncidentMetrics } from "../incident/incident.metrics";
import { getOperationsIncident } from "../incident/incident.model";
import { computeProductionMetrics } from "../production/production.metrics";
import { computeReleaseMetrics } from "../release/release.metrics";
import { getOperationsRelease } from "../release/release.lifecycle";
import { computeEnterpriseSupportMetrics } from "../support/support.metrics";
import { getEnterpriseSupportCase } from "../support/support.case";
import { DOMAIN_HEALTH_LEVELS } from "./control.constants";
import { getOperationsOrchestration } from "./control.orchestration";
import type {
  AggregatedOpsHealth,
  DomainHealthLevel,
  DomainHealthRecord,
  OpsOrchestrationDomain,
} from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

function levelFromScore(score: number): DomainHealthLevel {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "WATCH";
  if (score >= 40) return "DEGRADED";
  if (score > 0) return "CRITICAL";
  return "UNKNOWN";
}

function record(
  domain: OpsOrchestrationDomain,
  score: number,
  detail: string,
): DomainHealthRecord {
  const level = levelFromScore(score);
  if (!(DOMAIN_HEALTH_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid domain health level: ${level}`);
  }
  return { domain, level, score: Math.max(0, Math.min(100, score)), detail };
}

export function aggregateOperationsHealth(
  orchestrationId: string,
): AggregatedOpsHealth {
  const orchestration = getOperationsOrchestration(orchestrationId.trim());
  if (!orchestration) {
    throw new Error(`operations orchestration not found: ${orchestrationId}`);
  }

  const domains: DomainHealthRecord[] = [];

  try {
    const prod = computeProductionMetrics(orchestration.productionOperationId);
    domains.push(
      record(
        "PRODUCTION",
        prod.readinessScore,
        `production readiness=${prod.readinessScore}`,
      ),
    );
  } catch {
    domains.push(record("PRODUCTION", 0, "production metrics unavailable"));
  }

  if (orchestration.customerHealthProfileId) {
    const health = getCustomerHealthProfile(
      orchestration.customerHealthProfileId,
    );
    domains.push(
      record(
        "CUSTOMER_SUCCESS",
        health?.score ?? 0,
        health
          ? `health=${health.health} score=${health.score}`
          : "customer health missing",
      ),
    );
  } else {
    domains.push(record("CUSTOMER_SUCCESS", 50, "customer success unbound"));
  }

  if (orchestration.operationsIncidentId) {
    const incident = getOperationsIncident(orchestration.operationsIncidentId);
    const metrics = computeIncidentMetrics({
      productionOperationId: orchestration.productionOperationId,
    });
    const openPenalty =
      incident &&
      incident.status !== "RESOLVED" &&
      incident.status !== "CLOSED"
        ? 25
        : 0;
    domains.push(
      record(
        "INCIDENT",
        Math.max(0, metrics.mttrScore - openPenalty),
        `mttr=${metrics.mttrScore} openPenalty=${openPenalty}`,
      ),
    );
  } else {
    domains.push(record("INCIDENT", 85, "no bound incident"));
  }

  if (orchestration.operationsReleaseId) {
    const release = getOperationsRelease(orchestration.operationsReleaseId);
    const metrics = computeReleaseMetrics({
      productionOperationId: orchestration.productionOperationId,
    });
    const statusBoost =
      release?.status === "RELEASED"
        ? 10
        : release?.status === "ROLLED_BACK"
          ? -10
          : 0;
    domains.push(
      record(
        "RELEASE",
        Math.max(0, Math.min(100, metrics.releaseSuccessScore + statusBoost)),
        `release=${release?.status ?? "missing"} score=${metrics.releaseSuccessScore}`,
      ),
    );
  } else {
    domains.push(record("RELEASE", 70, "release unbound"));
  }

  if (orchestration.growthDashboardId) {
    const dashboard = getGrowthDashboard(orchestration.growthDashboardId);
    domains.push(
      record(
        "GROWTH",
        dashboard?.growthScore ?? 0,
        dashboard
          ? `growthScore=${dashboard.growthScore}`
          : "growth dashboard missing",
      ),
    );
  } else {
    domains.push(record("GROWTH", 65, "growth unbound"));
  }

  if (orchestration.supportCaseId) {
    const supportCase = getEnterpriseSupportCase(orchestration.supportCaseId);
    const metrics = computeEnterpriseSupportMetrics({
      productId: orchestration.productId,
      supportSlaProfileId: supportCase?.supportSlaProfileId,
    });
    domains.push(
      record(
        "SUPPORT",
        metrics.supportHealthScore,
        `supportHealth=${metrics.supportHealthScore} case=${supportCase?.status ?? "missing"}`,
      ),
    );
  } else {
    domains.push(record("SUPPORT", 75, "support unbound"));
  }

  const overallScore = Math.round(
    domains.reduce((sum, d) => sum + d.score, 0) / domains.length,
  );
  const overallLevel = levelFromScore(overallScore);
  const degradedDomains = domains
    .filter(
      (d) =>
        d.level === "DEGRADED" ||
        d.level === "CRITICAL" ||
        d.level === "UNKNOWN",
    )
    .map((d) => d.domain);

  return {
    orchestrationId: orchestration.id,
    domains,
    overallLevel,
    overallScore,
    degradedDomains,
    computedAt: nowIso(),
  };
}
