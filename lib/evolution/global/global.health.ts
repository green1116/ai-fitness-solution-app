/**
 * Evolution P5 — Regional Health
 * Integrates cloud runtime + ops control health
 */

import { checkRuntimeHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { aggregateOperationsHealth } from "../../operations/control/control.health";
import { REGIONAL_HEALTH_LEVELS } from "./global.constants";
import { getDeploymentIntelligence } from "./global.deployment";
import { getMultiRegionProfile } from "./global.region";
import type {
  AssessRegionalHealthInput,
  RegionalHealthLevel,
  RegionalHealthReport,
} from "./global.types";

const reports = new Map<string, RegionalHealthReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: RegionalHealthReport): RegionalHealthReport {
  return { ...report };
}

function levelFromScore(score: number): RegionalHealthLevel {
  if (score >= 75) return "HEALTHY";
  if (score >= 45) return "DEGRADED";
  if (score > 0) return "UNHEALTHY";
  return "UNKNOWN";
}

export function assessRegionalHealth(
  input: AssessRegionalHealthInput,
): RegionalHealthReport {
  const intel = getDeploymentIntelligence(
    input.deploymentIntelligenceId.trim(),
  );
  if (!intel) {
    throw new Error(
      `deployment intelligence not found: ${input.deploymentIntelligenceId}`,
    );
  }

  const regionProfileId = input.regionProfileId.trim();
  if (!intel.regionProfileIds.includes(regionProfileId)) {
    throw new Error(
      `region profile not bound to deployment intelligence: ${regionProfileId}`,
    );
  }

  const region = getMultiRegionProfile(regionProfileId);
  if (!region) {
    throw new Error(`multi-region profile not found: ${regionProfileId}`);
  }

  let runtimeHealthy = false;
  let runtimeScore = 40;
  if (region.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(region.cloudRuntimeId);
      runtimeHealthy = report.level === "HEALTHY";
      runtimeScore =
        report.level === "HEALTHY"
          ? 90
          : report.level === "DEGRADED"
            ? 55
            : report.level === "UNHEALTHY"
              ? 25
              : 35;
    } catch {
      runtimeHealthy = false;
      runtimeScore = 30;
    }
  }

  let opsScore = 55;
  try {
    opsScore = aggregateOperationsHealth(intel.orchestrationId).overallScore;
  } catch {
    opsScore = 50;
  }

  const score = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        runtimeScore * 0.55 + opsScore * 0.3 + region.weight * 0.15,
      ),
    ),
  );
  const level = levelFromScore(score);
  if (!(REGIONAL_HEALTH_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid regional health level: ${level}`);
  }

  const id = input.id?.trim() || createId("reghealth");
  if (reports.has(id)) {
    throw new Error(`regional health report already exists: ${id}`);
  }

  const report: RegionalHealthReport = {
    id,
    deploymentIntelligenceId: intel.id,
    regionProfileId: region.id,
    region: region.region,
    level,
    score,
    runtimeHealthy,
    opsScore,
    detail: `region=${region.region} level=${level} score=${score}`,
    assessedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getRegionalHealthReport(
  id: string,
): RegionalHealthReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listRegionalHealthReports(filter?: {
  deploymentIntelligenceId?: string;
  level?: RegionalHealthLevel;
}): RegionalHealthReport[] {
  let result = [...reports.values()];
  if (filter?.deploymentIntelligenceId) {
    const iid = filter.deploymentIntelligenceId.trim();
    result = result.filter((r) => r.deploymentIntelligenceId === iid);
  }
  if (filter?.level) result = result.filter((r) => r.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearRegionalHealthReports(): void {
  reports.clear();
}
