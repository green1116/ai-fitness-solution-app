/**
 * V80 Pilot P7 — Completion freeze & delivery lock verification
 */
import {
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  freezeIntakeSession,
  getIntakeFreezeSnapshot,
  getIntakeHistory,
  listIntakeAudit,
  maybeFreezeIntakeOnReady,
  patchIntakeRequirements,
  resetIntakeRequirements,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
二、技术需求
1. 跑步机不少于 8 台
项目预算限价 280 万元
`.trim();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertThrows(fn: () => unknown, code: string) {
  try {
    fn();
    throw new Error(`EXPECTED_THROW:${code}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === `EXPECTED_THROW:${code}`) throw e;
    assert(msg.includes(code), `expected ${code}, got ${msg}`);
  }
}

async function main() {
  console.log("V80 Pilot P7 — Completion Freeze & Delivery Lock\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "t.pdf",
  });

  const session = createIntakeSession({
    organizationId: "org-freeze",
    userId: "freeze-user",
    fileName: "t.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-1",
    productionQuoteId: "quote-1",
    productionTenderId: "tender-1",
    v80WorkflowJobId: "wf-1",
  });

  assertThrows(() => {
    freezeIntakeSession({
      sessionId: session.id,
      organizationId: "wrong-org",
      actorId: "freeze-user",
    });
  }, "ORG_MISMATCH");

  const frozen = freezeIntakeSession({
    sessionId: session.id,
    organizationId: "org-freeze",
    actorId: "freeze-user",
  });
  assert(frozen.frozen === true, "frozen");
  assert(frozen.freezeReasonCode === "DELIVERY_READY", "reason");
  assert(frozen.deliveryLock.readOnly === true, "readOnly");
  assert(frozen.deliveryLock.deliveryLocked === true, "deliveryLocked");
  assert(Boolean(frozen.deliveryLock.frozenState?.projectId), "frozenState projectId");
  console.log("✓ freeze on ready session");

  const audit = listIntakeAudit(session.id);
  assert(audit.some((e) => e.step === "freeze"), "audit freeze");
  assert(audit.some((e) => e.step === "delivery_lock"), "audit delivery_lock");
  console.log("✓ freeze audit trail");

  const again = freezeIntakeSession({
    sessionId: session.id,
    organizationId: "org-freeze",
    actorId: "freeze-user",
  });
  assert(again.idempotent === true, "idempotent freeze");
  assert(
    listIntakeAudit(session.id).filter((e) => e.step === "freeze").length === 1,
    "no duplicate freeze audit",
  );
  console.log("✓ idempotent freeze");

  assertThrows(
    () =>
      patchIntakeRequirements({
        sessionId: session.id,
        organizationId: "org-freeze",
        requirements: { ...extracted, projectName: "mutated" },
        actorId: "freeze-user",
      }),
    "SESSION_FROZEN",
  );
  console.log("✓ patch blocked after freeze");

  assertThrows(
    () =>
      resetIntakeRequirements({
        sessionId: session.id,
        organizationId: "org-freeze",
        actorId: "freeze-user",
      }),
    "SESSION_FROZEN",
  );
  console.log("✓ reset blocked after freeze");

  const snapshot = getIntakeFreezeSnapshot(
    updateIntakeSession(session.id, {}, { bypassFreeze: true })!,
  );
  assert(snapshot.frozen && snapshot.readOnly, "snapshot readOnly");
  console.log("✓ delivery lock snapshot");

  const auto = maybeFreezeIntakeOnReady({
    sessionId: session.id,
    organizationId: "org-freeze",
    actorId: "freeze-user",
  });
  assert(auto?.idempotent === true, "auto-freeze idempotent");
  console.log("✓ maybeFreezeIntakeOnReady idempotent");

  const historyResult = await getIntakeHistory(session.id, "org-freeze");
  if (!historyResult) throw new Error("ASSERT: history missing");
  assert(historyResult.canRecover === false, "canRecover false when frozen");
  assert(historyResult.canRetry === false, "canRetry false when frozen");
  assert(historyResult.deliveryLock?.frozen === true, "history deliveryLock");
  console.log("✓ history read-only flags");

  console.log("\nPASS — V80 Pilot P7 freeze lock (in-memory)");
  console.log("  E2E: upload → approve → generate → ready → freeze → read only");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
