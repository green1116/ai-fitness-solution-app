/**
 * Prisma Stability V3 — human-readable recovery instructions
 */

import type { RollbackPlan } from "../rollback/rollback.plan";
import type { RecoverySafetyResult } from "./recovery.safety.checker";

export type RecoveryInstructions = {
  title: string;
  steps: string[];
  cautions: string[];
};

export function buildRecoveryInstructions(
  safety: RecoverySafetyResult,
  rollbackPlan?: RollbackPlan,
): RecoveryInstructions {
  const steps: string[] = [
    "1. Stop further deploys — set PRISMA_MIGRATION_STRICT=1",
    "2. Run npm run prisma:validate",
    "3. Run npm run prisma:snapshot to capture current state",
    "4. Review npm run prisma:diff output",
  ];

  if (rollbackPlan) {
    steps.push("5. Execute rollback plan (manual — never auto-apply in production):");
    for (const s of rollbackPlan.steps) {
      steps.push(`   ${s.order}. ${s.action}`);
      if (s.prismaHint) steps.push(`      → ${s.prismaHint}`);
    }
  } else {
    steps.push("5. Generate rollback: npm run prisma:migration-safety");
  }

  steps.push(
    "6. Run npx prisma generate",
    "7. Verify with npm run prisma:preflight",
    "8. Re-deploy only after all gates pass",
  );

  const cautions: string[] = [
    "Never auto-execute DROP or RENAME in production",
    "Restore database from backup if model drops were deployed",
    ...safety.warnings,
  ];

  if (!safety.canRecover) {
    cautions.unshift("Recovery requires manual DBA intervention");
  }

  return {
    title: "Prisma Recovery Procedure",
    steps,
    cautions,
  };
}

export function formatRecoveryInstructions(instr: RecoveryInstructions): string {
  const lines = [instr.title, "", "Steps:", ...instr.steps.map((s) => (s.startsWith("   ") ? s : `  ${s}`)), ""];
  if (instr.cautions.length > 0) {
    lines.push("Cautions:");
    for (const c of instr.cautions) lines.push(`  ⚠ ${c}`);
  }
  return lines.join("\n");
}
