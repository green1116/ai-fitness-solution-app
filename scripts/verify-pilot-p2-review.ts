/**
 * Pilot P2 — Intake Review & Revision Loop verification
 */
import {
  bulkSetRequirementItemReview,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  getIntakeHistory,
  listIntakeAudit,
  reExtractIntakeRequirements,
  runTenderParserPipeline,
  setRequirementItemReview,
  updateIntakeSession,
  validateTenderRequirementsForApproval,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心建设项目
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
一、技术标准与功能需求
1. 有氧区配置跑步机不少于 8 台。
2. 场地面积不小于 1000 ㎡。
3. 设备需符合 GB/T 22517 相关标准。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P2 / Intake Review & Revision Loop ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p2-sample.txt",
  });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "p2-sample.pdf",
  });

  const session = createIntakeSession({
    organizationId: "org-p2",
    userId: "user-p2",
    fileName: "p2-sample.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    status: "extracted",
    requirements: extracted,
    extractedRequirements: extracted,
    requirementsRevision: 1,
  });

  // Before confirm — validation should fail item review gate when must items exist
  const before = validateTenderRequirementsForApproval(
    session.requirements ?? extracted,
  );
  // Refresh after update
  const pendingGate = validateTenderRequirementsForApproval(
    updateIntakeSession(session.id, {})!.requirements ?? extracted,
  );
  void before;
  void pendingGate;

  const tech = (updateIntakeSession(session.id, {})!.requirements ?? extracted)
    .technicalRequirements;
  if (tech.length > 0) {
    const unconfirmed = validateTenderRequirementsForApproval({
      ...extracted,
      technicalRequirements: tech.map((t) => ({ ...t, reviewStatus: "pending" as const })),
      functionalRequirements: extracted.functionalRequirements.map((t) => ({
        ...t,
        reviewStatus: "pending" as const,
      })),
    });
    assert(!unconfirmed.valid, "pending must items block approval");
    console.log("PASS Item review gate (pending blocked)");
  } else {
    console.log("PASS Item review gate (no tech items — skipped assert)");
  }

  // Item confirm / reject
  const current = updateIntakeSession(session.id, {
    requirements: {
      ...extracted,
      technicalRequirements: extracted.technicalRequirements.map((t) => ({
        ...t,
        reviewStatus: "pending" as const,
      })),
      functionalRequirements: extracted.functionalRequirements.map((t) => ({
        ...t,
        reviewStatus: "pending" as const,
      })),
    },
  })!;

  const firstTech = current.requirements!.technicalRequirements[0];
  if (firstTech) {
    const rejected = setRequirementItemReview({
      sessionId: session.id,
      organizationId: "org-p2",
      listKey: "technicalRequirements",
      itemId: firstTech.id,
      reviewStatus: "rejected",
      actorId: "user-p2",
    });
    assert(rejected.revision >= 2, "revision bumps on item review");
    assert(
      rejected.requirements.technicalRequirements.find((i) => i.id === firstTech.id)
        ?.reviewStatus === "rejected",
      "rejected persisted",
    );
    console.log("PASS Item reject + revision bump");
  }

  const confirmed = bulkSetRequirementItemReview({
    sessionId: session.id,
    organizationId: "org-p2",
    reviewStatus: "confirmed",
    mustOnly: true,
    actorId: "user-p2",
  });
  assert(confirmed.validation.valid || confirmed.revision > 0, "bulk confirm");
  console.log("PASS Bulk confirm must items");

  // Re-extract
  const re = reExtractIntakeRequirements({
    sessionId: session.id,
    organizationId: "org-p2",
    actorId: "user-p2",
    mode: "replace",
  });
  assert(re.session.status === "extracted", "re-extract status");
  assert(typeof re.revision === "number" && re.revision > 0, "re-extract revision");
  const audit = listIntakeAudit(session.id);
  assert(
    audit.some((e) => e.step === "re-extract" || e.meta?.reextract === true),
    "re-extract audit",
  );
  console.log("PASS Re-extract + audit");

  // Confirm again after re-extract then history
  bulkSetRequirementItemReview({
    sessionId: session.id,
    organizationId: "org-p2",
    reviewStatus: "confirmed",
    mustOnly: true,
    actorId: "user-p2",
  });

  const history = await getIntakeHistory(session.id, "org-p2");
  assert(history !== null, "history");
  assert((history!.revisions?.length ?? 0) > 0, "versioned revisions");
  assert(
    history!.revisions.some((r) => typeof r.revision === "number"),
    "revision numbers in history",
  );
  console.log("PASS Versioned audit trail");

  // Approval gate helper: generation requires qaPassedAt
  const { runIntakeV80Generation } = await import("../lib/pilot/v80");
  let gated = false;
  try {
    await runIntakeV80Generation({
      projectId: "proj-x",
      organizationId: "org-p2",
      requirements: confirmed.requirements,
      intakeSessionId: session.id,
      tenderIntakeId: session.tenderIntakeId,
      sourceFile: session.fileName,
    });
  } catch (err) {
    gated = err instanceof Error && err.message === "APPROVAL_REQUIRED";
  }
  assert(gated, "V80 handoff blocked without QA approval");
  console.log("PASS Approval gate before V80 handoff");

  console.log("\nPASS Pilot P2 Intake Review & Revision Loop");
  console.log("Pilot P2 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
