/**
 * V61 P8 — Launch readiness scoring
 */

import { buildLaunchReadinessReport as buildV60Readiness } from "@/lib/portal/v60/readiness/launch-readiness.engine";
import { buildSystemHealthReport } from "@/lib/portal/v60/health/system-health.engine";
import { validateCommercialWorkflow } from "../validation/commercial-workflow.engine";
import { validateProductionEnvironment } from "../validation/environment-validation.engine";
import { buildDebtClosureReport } from "../debt/debt-closure";

export type LaunchReadinessScores = {
  securityScore: number;
  integrityScore: number;
  performanceScore: number;
  observabilityScore: number;
  operationsScore: number;
  commercialReadinessScore: number;
  overallLaunchScore: number;
  blockers: string[];
};

export async function buildLaunchReadinessScores(
  organizationId?: string,
): Promise<LaunchReadinessScores> {
  const [v60, health, commercial, env, debt] = await Promise.all([
    buildV60Readiness(organizationId),
    buildSystemHealthReport(),
    Promise.resolve(validateCommercialWorkflow()),
    validateProductionEnvironment(),
    Promise.resolve(buildDebtClosureReport()),
  ]);

  const operationsScore = Math.round((health.score + env.score) / 2);
  const blockers = [...v60.blockers];
  if (!env.productionSafe && process.env.NODE_ENV === "production") {
    blockers.push("Environment validation failed for production");
  }
  if (!debt.highMediumEliminated) {
    blockers.push("Targeted technical debt not fully closed");
  }

  const overallLaunchScore = Math.round(
    v60.securityScore * 0.2 +
      v60.integrityScore * 0.15 +
      v60.performanceScore * 0.1 +
      v60.observabilityScore * 0.15 +
      operationsScore * 0.15 +
      commercial.score * 0.25,
  );

  return {
    securityScore: v60.securityScore,
    integrityScore: v60.integrityScore,
    performanceScore: v60.performanceScore,
    observabilityScore: v60.observabilityScore,
    operationsScore,
    commercialReadinessScore: commercial.score,
    overallLaunchScore,
    blockers: [...new Set(blockers)],
  };
}
