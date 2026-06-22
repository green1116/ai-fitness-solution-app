/**
 * Prisma Stability V3 — recovery engine
 */

import { captureSchemaSnapshot } from "../snapshot/schema.snapshot.engine";
import { recordSchemaChangeAudit } from "../audit/schema.change.log";
import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";
import { generateRollbackPlanV3 } from "../rollback/rollback.engine";
import { checkRecoverySafety } from "./recovery.safety.checker";
import {
  buildRecoveryInstructions,
  formatRecoveryInstructions,
  type RecoveryInstructions,
} from "./recovery.instructions";

export type RecoveryResult = {
  safety: ReturnType<typeof checkRecoverySafety>;
  instructions: RecoveryInstructions;
  formatted: string;
  snapshotId?: string;
};

export function recoverPrismaState(options?: { captureSnapshot?: boolean }): RecoveryResult {
  const safety = checkRecoverySafety();
  const rollback = generateRollbackPlanV3();
  const instructions = buildRecoveryInstructions(safety, rollback.plan);

  let snapshotId: string | undefined;
  if (options?.captureSnapshot !== false) {
    const snap = captureSchemaSnapshot("production");
    snapshotId = snap.id;

    const diff = runSchemaDiffAgainstBaseline();
    recordSchemaChangeAudit({
      author: snap.capturedBy,
      beforeHash: snap.schemaHash,
      afterHash: snap.schemaHash,
      affectedModels: diff.modelDiff.modifiedModels,
      affectedRelations: diff.relationChanges.map((r) => `${r.model}.${r.field}`),
      riskLevel: diff.riskLevel,
      rollbackAvailable: rollback.validation.feasible,
      snapshotId: snap.id,
      summary: "recovery snapshot captured",
    });
  }

  return {
    safety,
    instructions,
    formatted: formatRecoveryInstructions(instructions),
    snapshotId,
  };
}
