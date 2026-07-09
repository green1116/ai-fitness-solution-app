/**
 * V80 Pilot P8 — Final sign-off & release package verification
 */
import {
  appendIntakeAudit,
  assertIntakeSignoffPass,
  buildIntakeReleaseManifest,
  buildIntakeRollbackIndex,
  buildIntakeSignoffReport,
  clearIntakeStoreForTests,
  createIntakeSession,
  evaluateReleaseGates,
  extractRequirementsFromParsedTender,
  freezeIntakeSession,
  IntakeSignoffError,
  listIntakeAudit,
  RELEASE_GATE_CATALOG,
  runTenderParserPipeline,
  signOffIntakeSession,
  updateIntakeSession,
  V80_PILOT_SIGNOFF_VERSION,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
二、技术需求
1. 跑步机不少于 8 台
项目预算限价 280 万元
`.trim();

const ORG = "org-signoff";
const ACTOR = "signoff-user";

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

function seedPilotAudit(sessionId: string) {
  const base = { sessionId, organizationId: ORG, actorId: ACTOR };
  appendIntakeAudit({ ...base, step: "upload", message: "uploaded" });
  appendIntakeAudit({ ...base, step: "extract", message: "extracted" });
  appendIntakeAudit({ ...base, step: "validate", meta: { valid: true } });
  appendIntakeAudit({ ...base, step: "approve", statusAfter: "generating" });
  appendIntakeAudit({
    ...base,
    step: "generate",
    workflowStatusAfter: "completed",
    statusAfter: "ready",
  });
  appendIntakeAudit({ ...base, step: "qa", meta: { handoffReady: true } });
  appendIntakeAudit({ ...base, step: "handoff", message: "handoff complete" });
}

async function main() {
  console.log("V80 Pilot P8 — Final Sign-off & Release Package\n");
  clearIntakeStoreForTests();

  assert(RELEASE_GATE_CATALOG.length === 8, "P1–P8 gate catalog");
  console.log("✓ release gate catalog P1–P8");

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "t.pdf",
  });

  const session = createIntakeSession({
    organizationId: ORG,
    userId: ACTOR,
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
    qaPassedAt: new Date().toISOString(),
    deliveryLocked: true,
  });

  seedPilotAudit(session.id);

  try {
    await signOffIntakeSession({
      sessionId: session.id,
      organizationId: ORG,
      actorId: ACTOR,
    });
    throw new Error("EXPECTED_THROW:NOT_FROZEN");
  } catch (e) {
    if (e instanceof Error && e.message === "EXPECTED_THROW:NOT_FROZEN") throw e;
    assert(
      e instanceof IntakeSignoffError && e.code === "NOT_FROZEN",
      `expected NOT_FROZEN, got ${e instanceof Error ? e.message : e}`,
    );
  }
  console.log("✓ sign-off blocked before freeze");

  freezeIntakeSession({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
  });

  const audit = listIntakeAudit(session.id);
  const gates = evaluateReleaseGates(
    updateIntakeSession(session.id, {}, { bypassFreeze: true })!,
    audit,
  );
  assert(gates.filter((g) => g.phase !== "P8").every((g) => g.ok), "P1–P7 gates pass");
  console.log("✓ P1–P7 release gates");

  const manifest = await buildIntakeReleaseManifest(
    updateIntakeSession(session.id, {}, { bypassFreeze: true })!,
    ORG,
  );
  assert(manifest.version === V80_PILOT_SIGNOFF_VERSION, "manifest version");
  assert(Boolean(manifest.linkage.projectId), "manifest linkage");
  assert(manifest.deliveryLock.frozen === true, "manifest delivery lock");
  console.log("✓ release manifest");

  const rollback = buildIntakeRollbackIndex(
    updateIntakeSession(session.id, {}, { bypassFreeze: true })!,
    audit,
  );
  assert(rollback.some((r) => r.id === "explicit_recovery" && r.requiresExplicitAdmin), "admin path");
  assert(rollback.every((r) => r.id === "explicit_recovery" || !r.available), "frozen rollback blocked");
  console.log("✓ rollback index");

  const report = await buildIntakeSignoffReport(session.id, ORG);
  assert(report.readiness.state === "pass", "readiness pass");
  assert(report.signoffState.canSignOff === true, "can sign off");
  assert(report.deliveryChecklist.length >= 7, "delivery checklist");
  console.log("✓ readiness summary");

  const signed = await signOffIntakeSession({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
  });
  assert(signed.signedOff === true, "signed off");
  assert(Boolean(signed.releasePackageId), "release package id");
  assert(signed.report.readiness.state === "released", "released state");
  console.log("✓ final sign-off");

  const again = await signOffIntakeSession({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
  });
  assert(again.idempotent === true, "idempotent sign-off");
  assert(
    listIntakeAudit(session.id).filter((e) => e.step === "signoff").length === 1,
    "no duplicate signoff audit",
  );
  console.log("✓ idempotent sign-off");

  const finalAudit = listIntakeAudit(session.id);
  assert(finalAudit.some((e) => e.step === "signoff"), "audit signoff");
  assert(finalAudit.some((e) => e.step === "release_package"), "audit release_package");
  console.log("✓ sign-off audit trail");

  assertIntakeSignoffPass(signed.report);

  try {
    await buildIntakeSignoffReport("missing", ORG);
    throw new Error("EXPECTED_THROW:SESSION_NOT_FOUND");
  } catch (e) {
    assert(e instanceof IntakeSignoffError, "signoff error type");
  }
  console.log("✓ error handling");

  console.log("\nPASS — V80 Pilot P8 sign-off (in-memory)");
  console.log("  E2E: upload → approve → generate → ready → freeze → sign-off → release package");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
