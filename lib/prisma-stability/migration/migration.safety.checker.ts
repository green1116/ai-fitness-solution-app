/**
 * Prisma Stability — migration safety checker
 */

import type { SchemaDiff } from "./migration.diff.analyzer";

export type MigrationSafetyIssue = {
  severity: "error" | "warning";
  message: string;
  suggestion?: string;
};

export function checkMigrationSafety(diff: SchemaDiff): MigrationSafetyIssue[] {
  const issues: MigrationSafetyIssue[] = [];

  for (const removed of diff.removedModels) {
    const renamed = diff.renamedSuspects.find((r) => r.from === removed);
    if (!renamed) {
      issues.push({
        severity: "error",
        message: `Destructive removal: model ${removed} deleted without rename mapping`,
        suggestion: "Use new model + @@map or staged migration with compatibility view",
      });
    } else {
      issues.push({
        severity: "warning",
        message: `Possible rename ${removed} → ${renamed.to} (${renamed.reason})`,
        suggestion: "Verify @@map and relation updates before deploy",
      });
    }
  }

  if (diff.addedModels.length > 5) {
    issues.push({
      severity: "warning",
      message: `Large schema expansion: ${diff.addedModels.length} new models`,
      suggestion: "Split migration into smaller deployable steps",
    });
  }

  return issues;
}

export function generateMigrationPlan(diff: SchemaDiff): string[] {
  const plan: string[] = ["1. Run prisma validate", "2. Run prisma generate"];

  if (diff.removedModels.length > 0) {
    plan.push("3. Review destructive model removals");
    plan.push("4. Create backward-compatible migration SQL");
  } else {
    plan.push("3. prisma migrate dev (local) or migrate deploy (prod)");
  }

  plan.push("5. Run prisma:preflight before deploy");
  return plan;
}
