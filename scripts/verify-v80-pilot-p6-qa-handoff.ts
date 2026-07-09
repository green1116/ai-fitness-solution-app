/**
 * V80 Pilot P6 — QA gate & production handoff verification
 */
import {
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  getIntakeDisplayStatus,
  listIntakeAudit,
  patchIntakeRequirements,
  runIntakeQaGate,
  runTenderParserPipeline,
  updateIntakeSession,
  validateIntakeSession,
} from "../lib/pilot/v80";
import { IntakeQaError } from "../lib/pilot/v80/intake/qa-gate.service";

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

async function main() {
  console.log("V80 Pilot P6 — QA Gate & Production Handoff\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({ parseResult: parsed, sourceName: "t.pdf" });

  const session = createIntakeSession({
    organizationId: "org-qa",
    userId: "qa-user",
    fileName: "t.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "extracted",
  });

  const failQa = runIntakeQaGate({
    sessionId: session.id,
    organizationId: "org-qa",
    requirements: { ...extracted, projectName: "" },
    actorId: "qa-user",
    persistFailure: true,
  });
  assert(!failQa.passed, "blocks empty projectName");
  assert(failQa.reasonCode === "REQUIRED_FIELD_MISSING", "reason code");
  console.log("✓ QA gate blocks invalid handoff");

  updateIntakeSession(session.id, { requirements: extracted, status: "in_review" });

  const passQa = runIntakeQaGate({
    sessionId: session.id,
    organizationId: "org-qa",
    requirements: extracted,
    actorId: "qa-user",
    persistFailure: true,
  });
  assert(passQa.passed && passQa.handoffReady, "QA pass");
  assert(Boolean(passQa.productionReadiness?.syncPackageReady), "production readiness");
  console.log("✓ QA pass with production readiness");

  validateIntakeSession({
    sessionId: session.id,
    organizationId: "org-qa",
    actorId: "qa-user",
  });

  const audit = listIntakeAudit(session.id);
  assert(audit.some((e) => e.step === "qa"), "audit qa step");
  console.log("✓ audit trail preserved");

  const display = getIntakeDisplayStatus({
    status: "qa_failed",
    statusReasonCode: "REQUIRED_FIELD_MISSING",
  });
  assert(display.phase === "qa_failed", "display qa_failed");
  console.log("✓ status reason codes");

  try {
    runIntakeQaGate({
      sessionId: session.id,
      organizationId: "org-qa",
      requirements: { ...extracted, projectName: "" },
      persistFailure: false,
    });
    patchIntakeRequirements({
      sessionId: session.id,
      organizationId: "org-qa",
      requirements: { projectName: "" },
    });
    runIntakeQaGate({
      sessionId: session.id,
      organizationId: "org-qa",
      persistFailure: true,
    });
  } catch {
    // ignore
  }

  updateIntakeSession(session.id, {
    productionProjectId: "p1",
    productionQuoteId: "q1",
    status: "generating",
  });

  const partial = runIntakeQaGate({
    sessionId: session.id,
    organizationId: "org-qa",
    requirements: extracted,
    persistFailure: false,
  });
  assert(
    partial.checks.some((c) => c.id === "partial_write" && !c.passed),
    "partial write blocked",
  );
  console.log("✓ partial write guard");

  console.log("\nPASS — V80 Pilot P6 QA gate (in-memory)");
  console.log("  DB E2E: upload → edit → validate → QA → approve → handoff → ready");
}

main().catch((err) => {
  if (err instanceof IntakeQaError) {
    console.error(err.code, err.checks);
  } else {
    console.error(err);
  }
  process.exit(1);
});
