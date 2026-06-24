/**
 * V60 P12 — Launch readiness scoring
 */

import { runSecurityAudit } from "../audit/security-audit.engine";
import { runBoundaryValidation } from "../audit/boundary-validation.engine";
import { runIntegrityCheck } from "../audit/integrity.engine";
import { runPerformanceAudit } from "../audit/performance-audit.engine";
import { buildSystemHealthReport } from "../health/system-health.engine";
import { getReadonlyCacheStats } from "../cache/readonly-cache";

export type LaunchReadinessReport = {
  securityScore: number;
  integrityScore: number;
  observabilityScore: number;
  performanceScore: number;
  overallReadinessScore: number;
  productionReady: boolean;
  blockers: string[];
  generatedAt: string;
};

export async function buildLaunchReadinessReport(
  organizationId?: string,
): Promise<LaunchReadinessReport> {
  const [security, boundary, integrity, performance, health, cache] = await Promise.all([
    Promise.resolve(runSecurityAudit()),
    Promise.resolve(runBoundaryValidation()),
    runIntegrityCheck(organizationId),
    Promise.resolve(runPerformanceAudit()),
    buildSystemHealthReport(),
    Promise.resolve(getReadonlyCacheStats()),
  ]);

  const observabilityScore = Math.round(
    (health.score + (cache.size >= 0 ? 88 : 70)) / 2,
  );

  const overallReadinessScore = Math.round(
    security.score * 0.3 +
      integrity.score * 0.25 +
      observabilityScore * 0.2 +
      performance.score * 0.15 +
      boundary.score * 0.1,
  );

  const blockers: string[] = [];
  if (security.byLevel.critical > 0) blockers.push("Critical security findings");
  if (boundary.crossOrgRisk) blockers.push("Cross-organization boundary failures");
  if (integrity.issues.some((i) => i.severity === "critical")) blockers.push("Critical integrity issues");
  if (health.overall === "down") blockers.push("Subsystem health down");

  return {
    securityScore: security.score,
    integrityScore: integrity.score,
    observabilityScore,
    performanceScore: performance.score,
    overallReadinessScore,
    productionReady: blockers.length === 0 && overallReadinessScore >= 85,
    blockers,
    generatedAt: new Date().toISOString(),
  };
}
