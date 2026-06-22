/**
 * Prisma Stability V3 — rollback safety validator
 */

import type { SchemaDiffReport } from "../diff/schema.diff.engine";
import {
  generateRollbackPlan,
  type RollbackPlan,
} from "./rollback.plan";

export type RollbackValidation = {
  ok: boolean;
  blocked: boolean;
  feasible: boolean;
  requiresManualRollback: boolean;
  errors: string[];
  warnings: string[];
  plan: RollbackPlan;
};

export function validateRollbackSafety(report: SchemaDiffReport): RollbackValidation {
  const plan = generateRollbackPlan(report);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!report.hasChanges) {
    return {
      ok: true,
      blocked: false,
      feasible: true,
      requiresManualRollback: false,
      errors: [],
      warnings: [],
      plan,
    };
  }

  const breaking = report.breakingChanges.length > 0;

  if (breaking && !plan.feasible) {
    errors.push("Breaking schema change without feasible rollback — model drops detected");
  }

  if (breaking && plan.steps.length < 3) {
    errors.push("Breaking change requires explicit rollback steps");
  }

  for (const removed of report.modelDiff.removedModels) {
    warnings.push(`Model ${removed} removed — manual data restore may be required`);
  }

  if (report.riskLevel === "CRITICAL" || report.riskLevel === "HIGH") {
    warnings.push(`Risk level ${report.riskLevel} — rollback must be tested on staging`);
  }

  const strict = process.env.PRISMA_ROLLBACK_STRICT !== "0";
  const blocked = strict && errors.length > 0;

  return {
    ok: errors.length === 0,
    blocked,
    feasible: plan.feasible,
    requiresManualRollback: breaking && !plan.feasible,
    errors,
    warnings,
    plan,
  };
}

export function blockUnsafeRollback(validation: RollbackValidation): void {
  if (validation.blocked) {
    throw new Error(
      `Unsafe rollback blocked:\n${validation.errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}
