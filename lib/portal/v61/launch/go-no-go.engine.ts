/**
 * V61 P10 — Go / No-Go decision engine
 */

import { buildLaunchChecklist } from "./launch-checklist.engine";
import { buildLaunchReadinessScores } from "./launch-readiness.engine";
import { buildDebtClosureReport } from "../debt/debt-closure";
import { validateAuthClosure } from "@/lib/portal/v61_1/auth/auth-closure.engine";
import { validateCommercialRegistration } from "@/lib/portal/v61_1/validation/commercial-registration.engine";
import { validateMigrationIntegrity } from "@/lib/portal/v61_1/validation/migration-validation.engine";
import { validateSchemaMigrations } from "@/lib/portal/v61_1/validation/schema-validation.engine";

export type GoNoGoDecision = "GO" | "NO-GO";

export type GoNoGoReport = {
  decision: GoNoGoDecision;
  overallLaunchScore: number;
  checklistReady: boolean;
  blockers: string[];
  reasons: string[];
  evaluatedAt: string;
};

export async function evaluateGoNoGo(organizationId?: string): Promise<GoNoGoReport> {
  const [checklist, scores, debt, migration, schema, auth, commercial] = await Promise.all([
    buildLaunchChecklist(),
    buildLaunchReadinessScores(organizationId),
    Promise.resolve(buildDebtClosureReport()),
    validateMigrationIntegrity(),
    validateSchemaMigrations(),
    Promise.resolve(validateAuthClosure()),
    Promise.resolve(validateCommercialRegistration()),
  ]);

  const blockers = [
    ...scores.blockers,
    ...migration.blockers,
    ...schema.blockers,
    ...auth.blockers,
    ...commercial.blockers,
  ];
  const reasons: string[] = [];

  if (checklist.ready) reasons.push("Launch checklist passed");
  else reasons.push(`Checklist ${checklist.passed}/${checklist.total} items passed`);

  if (debt.highMediumEliminated) reasons.push("Targeted High/Medium debt closed");
  if (scores.overallLaunchScore >= 85) reasons.push(`Overall launch score ${scores.overallLaunchScore}`);

  const criticalFails = checklist.items.filter((i) => i.status === "fail");
  for (const f of criticalFails) {
    blockers.push(`Checklist fail: ${f.label}`);
  }

  const decision: GoNoGoDecision =
    blockers.length === 0 &&
    checklist.ready &&
    scores.overallLaunchScore >= 85 &&
    debt.highMediumEliminated
      ? "GO"
      : "NO-GO";

  return {
    decision,
    overallLaunchScore: scores.overallLaunchScore,
    checklistReady: checklist.ready,
    blockers: [...new Set(blockers)],
    reasons,
    evaluatedAt: new Date().toISOString(),
  };
}
