/**
 * Prisma Stability V3 — recovery safety checker
 */

import { runSchemaGuard } from "../core/schema.guard";
import { isClientGenerated, assertClientInSync } from "../generate/client.sync.guard";
import { loadLatestSnapshot } from "../snapshot/schema.snapshot.store";
import { getCurrentSchemaHash } from "../snapshot/schema.snapshot.engine";
import { validateRollbackSafety } from "../rollback/rollback.validator";
import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";

export type RecoverySafetyResult = {
  ok: boolean;
  canRecover: boolean;
  errors: string[];
  warnings: string[];
  checks: { name: string; ok: boolean; detail?: string }[];
};

export function checkRecoverySafety(): RecoverySafetyResult {
  const checks: RecoverySafetyResult["checks"] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const guard = runSchemaGuard();
  checks.push({ name: "schema_guard", ok: guard.ok, detail: `${guard.modelCount} models` });
  if (!guard.ok) errors.push(...guard.errors);

  const snapshot = loadLatestSnapshot();
  const currentHash = getCurrentSchemaHash();
  const snapshotOk = !snapshot || snapshot.schemaHash === currentHash;
  checks.push({
    name: "snapshot_alignment",
    ok: snapshotOk,
    detail: snapshot ? `latest ${snapshot.schemaHash.slice(0, 12)}` : "no snapshot",
  });
  if (!snapshotOk) {
    warnings.push("Current schema differs from latest snapshot — recovery may need rollback");
  }

  const clientOk = isClientGenerated();
  checks.push({ name: "client_generated", ok: clientOk });
  if (!clientOk) errors.push("Prisma client not generated — run npm run prisma:generate");

  if (clientOk && snapshot) {
    const sync = assertClientInSync(Date.now());
    checks.push({ name: "client_sync", ok: sync.ok, detail: sync.message });
    if (!sync.ok) warnings.push(sync.message ?? "client may be stale");
  }

  const diffReport = runSchemaDiffAgainstBaseline();
  const rollback = validateRollbackSafety(diffReport);
  checks.push({
    name: "rollback_plan",
    ok: rollback.ok,
    detail: rollback.feasible ? "feasible" : "manual required",
  });
  if (rollback.blocked) errors.push(...rollback.errors);

  return {
    ok: errors.length === 0,
    canRecover: errors.length === 0 && rollback.feasible,
    errors,
    warnings,
    checks,
  };
}
