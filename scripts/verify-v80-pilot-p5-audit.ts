/**
 * V80 Pilot P5 — Intake audit trail & recovery verification
 */
import {
  clearIntakeStoreForTests,
  createIntakeSession,
  diffRequirements,
  extractRequirementsFromParsedTender,
  getIntakeHistory,
  listIntakeAudit,
  patchIntakeRequirements,
  recoverIntakeSession,
  runTenderParserPipeline,
  updateIntakeSession,
  validateIntakeSession,
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

async function main() {
  console.log("V80 Pilot P5 — Intake Audit Trail & Recovery\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({ parseResult: parsed, sourceName: "t.pdf" });

  const session = createIntakeSession({
    organizationId: "org-audit",
    userId: "audit-user",
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

  const patched = patchIntakeRequirements({
    sessionId: session.id,
    organizationId: "org-audit",
    requirements: { projectName: "审计编辑项目" },
    actorId: "audit-user",
  });
  assert(patched.requirements.projectName === "审计编辑项目", "patch applied");

  const validation = validateIntakeSession({
    sessionId: session.id,
    organizationId: "org-audit",
    actorId: "audit-user",
  });
  assert(validation.valid, "validation passes");

  const audit = listIntakeAudit(session.id);
  assert(audit.some((e) => e.step === "patch"), "audit patch");
  assert(audit.some((e) => e.step === "validate"), "audit validate");
  assert(audit.filter((e) => e.requirementsSnapshot).length >= 2, "requirement revisions");
  console.log("✓ audit trail for patch / validate");

  const diff = diffRequirements(extracted, patched.requirements);
  assert("projectName" in diff, "payload diff captured");
  console.log("✓ payload diff");

  const history = await getIntakeHistory(session.id, "org-audit");
  assert(history !== null, "history snapshot");
  assert(history!.revisions.length >= 2, "history revisions");
  assert(history!.canRecover === true, "can recover before approve");
  console.log("✓ history view");

  const rollback = await recoverIntakeSession({
    sessionId: session.id,
    organizationId: "org-audit",
    actorId: "audit-user",
    action: "rollback_valid",
  });
  assert(rollback.action === "rollback_valid", "rollback action");
  assert(rollback.requirements.projectName.length > 0, "rollback requirements");
  assert(listIntakeAudit(session.id).some((e) => e.step === "rollback"), "audit rollback");
  console.log("✓ rollback to last valid review");

  const restore = await recoverIntakeSession({
    sessionId: session.id,
    organizationId: "org-audit",
    actorId: "audit-user",
    action: "restore_snapshot",
    auditEntryId: audit.find((e) => e.step === "patch")!.id,
  });
  assert(restore.requirements.projectName === "审计编辑项目", "restore snapshot");
  assert(listIntakeAudit(session.id).some((e) => e.step === "recover"), "audit recover");
  console.log("✓ restore requirement snapshot");

  updateIntakeSession(session.id, {
    status: "generating",
    productionProjectId: "proj_sim",
    productionQuoteId: "quote_sim",
    productionTenderId: "tender_sim",
    workflowStatus: "failed",
  });

  const failHistory = await getIntakeHistory(session.id, "org-audit");
  assert(failHistory!.canRetry === true, "can retry after failed generation");
  console.log("✓ failed generation recovery entry");

  console.log("\nPASS — V80 Pilot P5 audit & recovery (in-memory)");
  console.log("  DB E2E: upload → approve → generate → fail → recover → retry → ready");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
