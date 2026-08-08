/**
 * Pilot P1 — Tender Intake verification
 * Upload/Parse → Extract → Map Project/Quote → Review → V80 hand-off package
 */
import {
  buildIntakeSyncPackage,
  bulkSetRequirementItemReview,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  mapRequirementsToProjectInput,
  mapRequirementsToQuoteCompanyInfo,
  parseTenderRequirements,
  patchIntakeRequirements,
  runTenderParserPipeline,
  updateIntakeSession,
  validateTenderRequirementsForApproval,
} from "../lib/pilot/v80";

const SAMPLE_TENDER = `
项目名称：星河科技园企业健身中心建设项目
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
行业领域：企业健身 / 商业健身
一、项目目标
建设面积约 1200 平方米的企业健身中心，服务园区 200 名员工。
二、技术标准与功能需求
1. 有氧区配置跑步机不少于 8 台，力量区器械满足国标要求。
2. 场地面积不小于 1000 ㎡，净高不低于 3.2m。
3. 设备需符合 GB/T 22517 相关标准，提供 2 年质保。
三、商务与预算
项目预算限价 280 万元，投标截止 2026-08-01。
四、评标办法
技术标 60 分，商务标 40 分。
五、交付成果
提交方案书、设备清单、预算书及施工组织方案。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P1 / Tender Intake & Requirement Extraction ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE_TENDER,
    fileName: "sample-tender.txt",
  });
  assert(parsed.rawText.length > 100, "parser pipeline");
  console.log("PASS Upload/Parse pipeline");

  const requirements = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "sample-tender.pdf",
  });
  assert(Boolean(requirements.projectName), "projectName");
  assert(
    requirements.technicalRequirements.length > 0 ||
      requirements.functionalRequirements.length > 0 ||
      requirements.objectives.length > 0,
    "extracted requirements",
  );
  const normalized = parseTenderRequirements(requirements);
  assert(normalized.projectName.length > 0, "schema normalize");
  console.log("PASS Requirement schema");

  const projectInput = mapRequirementsToProjectInput(normalized, "org-p1");
  assert(projectInput.name.length > 0, "project name");
  assert(projectInput.organizationId === "org-p1", "project org");
  const companyInfo = mapRequirementsToQuoteCompanyInfo(normalized);
  assert(Boolean(companyInfo.companyName), "quote company");
  const sync = buildIntakeSyncPackage(normalized, "org-p1");
  assert(sync.projectInput.name === projectInput.name, "sync package");
  console.log("PASS Mapping to Project/Quote");

  const session = createIntakeSession({
    organizationId: "org-p1",
    userId: "user-p1",
    fileName: "sample-tender.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE_TENDER.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    status: "extracted",
    extractedRequirements: normalized,
    requirements: normalized,
  });
  const reviewed = patchIntakeRequirements({
    sessionId: session.id,
    organizationId: "org-p1",
    requirements: { ...normalized, projectName: `${normalized.projectName}（已审）` },
    actorId: "user-p1",
  });
  assert(reviewed.session.status === "in_review", "review status");
  assert(reviewed.requirements.projectName.includes("已审"), "review patch");
  const validation = validateTenderRequirementsForApproval(reviewed.requirements);
  // P2 item gate: confirm must items before approval validation passes
  if (!validation.valid) {
    const confirmed = bulkSetRequirementItemReview({
      sessionId: session.id,
      organizationId: "org-p1",
      reviewStatus: "confirmed",
      mustOnly: true,
      actorId: "user-p1",
    });
    assert(confirmed.validation.valid, `validation after confirm: ${JSON.stringify(confirmed.validation.errors)}`);
  } else {
    assert(validation.valid, `validation: ${JSON.stringify(validation.errors)}`);
  }
  console.log("PASS Review step");

  assert(Boolean(sync.tenderMetadata.intakeVersion), "handoff metadata");
  assert(Boolean(session.tenderIntakeId), "intake id for V80 bridge");
  console.log("PASS V80 hand-off package");

  console.log("\nPASS Pilot P1 Tender Intake");
  console.log("Pilot P1 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
