/**
 * Pilot P4 — Intake Ops & Exception Recovery verification
 * Stuck detection, failure normalization, ops board, safe resume routing.
 */
import {
  INTAKE_OPS_STUCK_MS,
  appendIntakeAudit,
  buildIntakeOpsSnapshot,
  clearIntakeStoreForTests,
  createIntakeSession,
  detectIntakeStuck,
  deriveIntakeOpsStatus,
  getIntakeSession,
  listIntakeAudit,
  listIntakeOpsBoard,
  listIntakeOpsExceptions,
  normalizeIntakeFailure,
  operatorResumeIntake,
  recommendOpsAction,
  resolveIntakeApprovePath,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：P4 运维恢复测试项目
招标人：测试单位
建设地点：北京
一、技术需求
1. 力量器械不少于 12 台。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function mustSession(id: string) {
  const s = getIntakeSession(id);
  if (!s) throw new Error("session missing");
  return s;
}

async function main() {
  console.log("=== Pilot P4 / Intake Ops & Exception Recovery ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p4.txt",
  });

  const orgId = "org-p4";
  const session = createIntakeSession({
    organizationId: orgId,
    userId: "user-p4",
    fileName: "p4.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  // --- Failure normalization ---
  updateIntakeSession(session.id, {
    status: "failed",
    workflowStatus: "failed",
    statusReasonCode: "WORKFLOW_CONFLICT",
    statusReasonMessage: "V80 step pack failed",
  });
  let failure = normalizeIntakeFailure(mustSession(session.id));
  assert(failure.code === "WORKFLOW_CONFLICT", "normalize workflow");
  assert(failure.category === "generation", "category generation");
  assert(failure.retryable === true, "retryable");
  assert(failure.source === "session", "source session");
  console.log("PASS Failure normalization (session reason)");

  // Partial: only project id set
  updateIntakeSession(session.id, {
    status: "approving",
    productionProjectId: "proj-only",
    statusReasonCode: undefined,
    statusReasonMessage: undefined,
  });
  assert(resolveIntakeApprovePath(mustSession(session.id)) === "partial_error", "partial path");
  failure = normalizeIntakeFailure(mustSession(session.id));
  assert(failure.code === "PARTIAL_WRITE_DETECTED", "normalize partial");
  assert(failure.retryable === false, "partial not auto-retryable");
  assert(deriveIntakeOpsStatus(mustSession(session.id)) === "partial", "ops partial");
  assert(recommendOpsAction(mustSession(session.id), "partial") === "inspect_partial", "inspect");
  console.log("PASS Partial write detection + ops status");

  // --- Stuck detection (inject aged now) ---
  updateIntakeSession(session.id, {
    status: "generating",
    productionProjectId: "proj-1",
    productionQuoteId: "quote-1",
    productionTenderId: "tender-1",
    workflowStatus: "running",
    statusReasonCode: undefined,
    statusReasonMessage: undefined,
  });
  const fresh = mustSession(session.id);
  const notStuck = detectIntakeStuck(fresh, Date.parse(fresh.updatedAt) + 60_000);
  assert(notStuck.stuck === false, "not stuck under threshold");

  const stuckNow = Date.parse(fresh.updatedAt) + INTAKE_OPS_STUCK_MS + 1;
  const stuck = detectIntakeStuck(fresh, stuckNow);
  assert(stuck.stuck === true, "stuck after threshold");
  assert(stuck.reason === "STUCK_GENERATING", "stuck reason");
  assert(deriveIntakeOpsStatus(fresh, stuckNow) === "stuck", "ops stuck");

  const snapStuck = buildIntakeOpsSnapshot(fresh, stuckNow);
  assert(snapStuck.opsStatus === "stuck", "snapshot stuck");
  assert(snapStuck.recommendedAction === "retry_generation", "recommend retry");
  console.log("PASS Stuck detection + recommended retry");

  // --- Failed ops + audit timeline ---
  updateIntakeSession(session.id, {
    status: "failed",
    workflowStatus: "failed",
    statusReasonCode: "CREATE_FAILED",
    statusReasonMessage: "quote create failed",
  });
  appendIntakeAudit({
    sessionId: session.id,
    organizationId: orgId,
    actorId: "user-p4",
    step: "approve",
    statusBefore: "approving",
    statusAfter: "failed",
    message: "create failed",
  });

  const board = listIntakeOpsBoard(orgId);
  assert(board.counts.failed >= 1, "board failed count");
  const exceptions = listIntakeOpsExceptions(orgId);
  assert(exceptions.some((e) => e.sessionId === session.id), "in exceptions");
  const row = exceptions.find((e) => e.sessionId === session.id)!;
  assert(row.failure.code === "CREATE_FAILED", "exception failure code");
  assert(row.timeline.some((t) => t.step === "approve"), "timeline has approve");
  console.log("PASS Ops board / exceptions / timeline");

  // Fresh partial for operator resume block
  clearIntakeStoreForTests();
  const s2 = createIntakeSession({
    organizationId: orgId,
    userId: "user-p4",
    fileName: "p4-partial.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(s2.id, {
    status: "approving",
    productionProjectId: "proj-p",
  });
  assert(deriveIntakeOpsStatus(mustSession(s2.id)) === "partial", "s2 partial");
  assert(
    recommendOpsAction(mustSession(s2.id), "partial") === "inspect_partial",
    "no auto retry on partial",
  );

  let threw = false;
  try {
    await operatorResumeIntake({
      sessionId: s2.id,
      organizationId: orgId,
      actorId: "ops-1",
      userEmail: "ops@test.local",
      action: "auto",
    });
  } catch (err) {
    threw = err instanceof Error && err.message === "PARTIAL_WRITE_DETECTED";
  }
  assert(threw, "operator resume blocks partial");
  const audit = listIntakeAudit(s2.id);
  assert(
    audit.some((e) => e.meta?.operator === true),
    "operator attempt audited",
  );
  console.log("PASS Operator resume blocks partial + audit");

  // Ready session ops status
  updateIntakeSession(s2.id, {
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-p",
    productionQuoteId: "quote-p",
    productionTenderId: "tender-p",
  });
  assert(deriveIntakeOpsStatus(mustSession(s2.id)) === "ready", "ready ops");
  assert(recommendOpsAction(mustSession(s2.id), "ready") === "none", "no action ready");
  console.log("PASS Ready ops status");

  console.log("\n=== ALL P4 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
