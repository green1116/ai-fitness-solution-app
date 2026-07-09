/**
 * V80 Pilot P2 — Review & approval hardening verification
 */
import {
  approveTenderIntake,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  mergeTenderRequirements,
  patchIntakeRequirements,
  resetIntakeRequirements,
  runTenderParserPipeline,
  updateIntakeSession,
  validateTenderRequirementsForApproval,
} from "../lib/pilot/v80";
import { buildIntakeSyncPackage } from "../lib/pilot/v80/intake/sync.service";
import { prisma } from "../lib/prisma";
import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
二、技术需求
1. 跑步机不少于 8 台
2. 场地面积不小于 1000 ㎡
项目预算限价 280 万元
`.trim();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("V80 Pilot P2 — Review & Approval Hardening\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({ parseResult: parsed, sourceName: "t.pdf" });

  const merged = mergeTenderRequirements(extracted, { projectName: "编辑后项目名" });
  assert(merged.technicalRequirements.length === extracted.technicalRequirements.length, "no field loss on merge");
  assert(merged.projectName === "编辑后项目名", "patch applied");
  console.log("✓ merge preserves extracted fields");

  const invalid = validateTenderRequirementsForApproval({ ...extracted, projectName: "" });
  assert(!invalid.valid, "blocks empty projectName");
  console.log("✓ validation blocks invalid approval");

  const tenant = await provisionTenant({
    organizationName: "P2 Review Org",
    plan: "PRO",
    adminEmail: "p2@v80.test",
  });

  await prisma.organization.upsert({
    where: { id: tenant.organizationId },
    create: {
      id: tenant.organizationId,
      name: "P2 Review Org",
      slug: `p2-review-${tenant.organizationId.slice(0, 8)}`,
    },
    update: {},
  });

  const session = createIntakeSession({
    organizationId: tenant.organizationId,
    userId: "p2-user",
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
    organizationId: tenant.organizationId,
    requirements: { projectName: "P2 审核项目", scope: extracted.scope },
  });
  assert(patched.requirements.projectName === "P2 审核项目", "patch sync to session");
  console.log("✓ review patch sync");

  const reset = resetIntakeRequirements({
    sessionId: session.id,
    organizationId: tenant.organizationId,
  });
  assert(reset.requirements.projectName === extracted.projectName, "reset to extracted");
  console.log("✓ reset to extracted snapshot");

  const sync = buildIntakeSyncPackage(patched.requirements, tenant.organizationId);
  assert(sync.projectInput.name === patched.requirements.projectName, "single-source project mapping");
  assert(
    (sync.tenderMetadata.requirements as { projectName: string }).projectName ===
      patched.requirements.projectName,
    "tender metadata sync",
  );
  console.log("✓ sync mapping single-source");

  const approved = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "p2-user",
    userEmail: "p2@v80.test",
    requirements: patched.requirements,
  });

  const tender = await prisma.tender.findUnique({ where: { id: approved.tenderId } });
  const meta = tender?.metadata as { requirements?: { projectName?: string } } | null;
  assert(meta?.requirements?.projectName === patched.requirements.projectName, "tender metadata persisted");

  const again = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "p2-user",
    userEmail: "p2@v80.test",
  });
  assert(again.idempotent === true, "idempotent approve");
  assert(again.projectId === approved.projectId, "no duplicate project");
  console.log("✓ idempotent approve — no duplicate writes");

  const tenderCount = await prisma.tender.count({ where: { projectId: approved.projectId } });
  assert(tenderCount === 1, "single tender record");
  console.log("✓ no duplicate tender");

  console.log("\n✅ V80 Pilot P2 Review & Approval — verify PASS");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
