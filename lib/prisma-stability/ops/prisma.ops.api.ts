/**
 * Prisma Stability V3 — ops API helpers
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPrismaOpsStatus,
  runPrismaOpsValidate,
  runPrismaOpsSnapshot,
} from "./prisma.ops.service";
import { generateRollbackPlanV3 } from "../rollback/rollback.engine";
import { recoverPrismaState } from "../recovery/prisma.recovery.engine";
import { generateSchemaReleaseNotes } from "../changelog/schema.release.notes";
import { formatOpsDashboard } from "./prisma.ops.dashboard";
import { loadLatestSnapshot } from "../snapshot/schema.snapshot.store";

export function opsUnauthorized() {
  return NextResponse.json({ ok: false, code: "OPS_DENIED" }, { status: 403 });
}

export function opsOk(data: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...data });
}

export function handleOpsStatus() {
  return opsOk({ status: getPrismaOpsStatus() });
}

export function handleOpsSnapshot(req: NextRequest) {
  const kind = (req.nextUrl.searchParams.get("kind") ?? "pre-migration") as
    | "baseline"
    | "pre-migration"
    | "post-migration"
    | "production";
  const snapshot = runPrismaOpsSnapshot(kind);
  return opsOk({ snapshot: { id: snapshot.id, kind: snapshot.kind, schemaHash: snapshot.schemaHash } });
}

export function handleOpsValidate() {
  const result = runPrismaOpsValidate();
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }
  return opsOk({ modelCount: result.modelCount });
}

export function handleOpsRollbackPlan() {
  const result = generateRollbackPlanV3();
  return opsOk({
    validation: result.validation,
    plan: result.plan,
    formatted: result.formatted,
  });
}

export function handleOpsRecover() {
  const result = recoverPrismaState({ captureSnapshot: true });
  return opsOk({
    safety: result.safety,
    instructions: result.instructions,
    formatted: result.formatted,
    snapshotId: result.snapshotId,
  });
}

export function handleOpsChangelog() {
  const notes = generateSchemaReleaseNotes();
  return opsOk({ releaseNotes: notes });
}

export function handleOpsDashboard() {
  return opsOk({ dashboard: formatOpsDashboard(), latest: loadLatestSnapshot()?.id });
}
