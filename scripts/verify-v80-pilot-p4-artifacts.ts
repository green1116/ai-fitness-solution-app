/**
 * V80 Pilot P4 — Artifact center & delivery visibility verification
 */
import {
  approveTenderIntake,
  buildIntakeLinkage,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  getIntakeDeliverySnapshot,
  getIntakeSession,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";
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
  console.log("V80 Pilot P4 — Artifact Center & Delivery Visibility\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({ parseResult: parsed, sourceName: "t.pdf" });

  const linkageSession = createIntakeSession({
    organizationId: "org-link-test",
    userId: "p4-user",
    fileName: "t.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });
  const linkage = buildIntakeLinkage(linkageSession);
  assert(linkage.intakeSessionId === linkageSession.id, "linkage session id");
  assert(linkage.tenderIntakeId === linkageSession.tenderIntakeId, "linkage tender intake id");
  console.log("✓ artifact linkage builder");

  const tenant = await provisionTenant({
    organizationName: "P4 Artifact Org",
    plan: "PRO",
    adminEmail: "p4@v80.test",
  });

  await prisma.organization.upsert({
    where: { id: tenant.organizationId },
    create: {
      id: tenant.organizationId,
      name: "P4 Artifact Org",
      slug: `p4-artifact-${tenant.organizationId.slice(0, 8)}`,
    },
    update: {},
  });

  const session = createIntakeSession({
    organizationId: tenant.organizationId,
    userId: "p4-user",
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

  const liveSession = getIntakeSession(session.id)!;

  const approved = await approveTenderIntake({
    sessionId: liveSession.id,
    organizationId: tenant.organizationId,
    userId: "p4-user",
    userEmail: "p4@v80.test",
    requirements: extracted,
  });
  assert(approved.workflowStatus === "completed", "generation completed");
  console.log("✓ approve → generate → ready");

  const refreshed = updateIntakeSession(session.id, { status: "approved" })!;
  const delivery = await getIntakeDeliverySnapshot(refreshed, tenant.organizationId);
  assert(delivery.phase === "ready", "delivery phase ready");
  assert(Boolean(delivery.linkage.projectId), "linkage projectId");
  assert(Boolean(delivery.linkage.quoteId), "linkage quoteId");
  assert(Boolean(delivery.linkage.tenderId), "linkage tenderId");
  assert(Boolean(delivery.documentCenterUrl), "document center url");
  assert(delivery.artifacts.length >= 1, "artifact list populated");
  console.log("✓ delivery snapshot with artifacts");

  const plan = delivery.artifacts.find((a) => a.kind === "plan");
  const budget = delivery.artifacts.find((a) => a.kind === "budget");
  const bundle = delivery.artifacts.find((a) => a.kind === "bundle" || a.kind === "tender_pack");
  assert(Boolean(plan || budget || bundle), "plan/budget/bundle visibility");
  console.log("✓ plan / budget / tender pack visibility");

  assert(delivery.canRetry === false, "no retry when ready");
  console.log("✓ retry guard when ready");

  console.log("\nPASS — V80 Pilot P4 artifact center");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
