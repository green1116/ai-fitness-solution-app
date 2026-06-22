/**
 * Prisma Stability V2 — automatic rollback plan generator
 */

import type { SchemaDiffReport } from "../diff/schema.diff.engine";
import type { ModelFieldChange } from "../diff/model.diff.analyzer";
import type { RelationChange } from "../diff/relation.diff.analyzer";

export type RollbackStep = {
  order: number;
  action: string;
  sqlHint?: string;
  prismaHint?: string;
};

export type RollbackPlan = {
  feasible: boolean;
  steps: RollbackStep[];
  notes: string[];
};

function rollbackForFieldChange(c: ModelFieldChange): RollbackStep | null {
  switch (c.kind) {
    case "field_removed":
      return {
        order: 0,
        action: `Restore column ${c.model}.${c.field}`,
        sqlHint: `ALTER TABLE "${c.model}" ADD COLUMN "${c.field}" ${c.before ?? "TEXT"};`,
        prismaHint: `Re-add field ${c.field} ${c.before ?? ""} to model ${c.model}`,
      };
    case "field_added":
      return {
        order: 0,
        action: `Remove added column ${c.model}.${c.field}`,
        sqlHint: `ALTER TABLE "${c.model}" DROP COLUMN "${c.field}";`,
      };
    case "type_changed":
      return {
        order: 0,
        action: `Revert type ${c.model}.${c.field}`,
        sqlHint: `ALTER TABLE "${c.model}" ALTER COLUMN "${c.field}" TYPE ...; -- restore ${c.before}`,
        prismaHint: `Change ${c.field} back to ${c.before}`,
      };
    case "model_removed":
      return {
        order: 0,
        action: `Restore model ${c.model}`,
        prismaHint: `Re-add entire model ${c.model} from git baseline`,
      };
    case "map_changed":
      return {
        order: 0,
        action: `Revert @@map on ${c.model}`,
        prismaHint: `@@map("${c.before}")`,
      };
    default:
      return null;
  }
}

function rollbackForRelation(r: RelationChange): RollbackStep | null {
  if (!r.breaking) return null;
  return {
    order: 1,
    action: `Revert relation ${r.model}.${r.field}`,
    prismaHint: r.before ? `Restore ${r.field} ${r.before}` : `Restore relation field ${r.field}`,
  };
}

export function generateRollbackPlan(report: SchemaDiffReport): RollbackPlan {
  if (!report.hasChanges) {
    return {
      feasible: true,
      steps: [{ order: 1, action: "No rollback needed — schema unchanged" }],
      notes: [],
    };
  }

  const steps: RollbackStep[] = [
    { order: 0, action: "Revert prisma/schema.prisma to baseline", prismaHint: "git checkout HEAD~1 -- prisma/schema.prisma" },
    { order: 1, action: "Run prisma validate" },
    { order: 2, action: "Run prisma generate" },
  ];

  let order = 3;
  for (const c of report.modelDiff.changes) {
    const step = rollbackForFieldChange(c);
    if (step) steps.push({ ...step, order: order++ });
  }
  for (const r of report.relationChanges) {
    const step = rollbackForRelation(r);
    if (step) steps.push({ ...step, order: order++ });
  }

  steps.push({
    order: order++,
    action: "Apply rollback migration",
    prismaHint: "prisma migrate dev --name rollback_<change> OR manual SQL from sqlHint above",
  });

  const notes: string[] = [];
  if (report.modelDiff.removedModels.length > 0) {
    notes.push("Model drops may cause irreversible data loss — restore from backup if deployed");
  }
  if (report.riskLevel === "CRITICAL" || report.riskLevel === "HIGH") {
    notes.push("High-risk change — test rollback on staging before production deploy");
  }

  return {
    feasible: report.modelDiff.removedModels.length === 0,
    steps: steps.sort((a, b) => a.order - b.order),
    notes,
  };
}

export function formatRollbackPlan(plan: RollbackPlan): string {
  const lines = ["Rollback Plan", ""];
  for (const step of plan.steps) {
    lines.push(`${step.order}. ${step.action}`);
    if (step.sqlHint) lines.push(`   SQL: ${step.sqlHint}`);
    if (step.prismaHint) lines.push(`   Prisma: ${step.prismaHint}`);
  }
  if (plan.notes.length > 0) {
    lines.push("", "Notes:");
    for (const n of plan.notes) lines.push(`  - ${n}`);
  }
  lines.push("", `Feasible without backup: ${plan.feasible ? "yes" : "no"}`);
  return lines.join("\n");
}
