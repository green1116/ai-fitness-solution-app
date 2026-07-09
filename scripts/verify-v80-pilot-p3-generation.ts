/**
 * V80 Pilot P3 — Tender-to-Plan / Quote auto-generation verification
 */
import {
  approveTenderIntake,
  buildIntakeV80PipelineInput,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  getIntakeGenerationProgress,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { buildIntakeSyncPackage } from "../lib/pilot/v80/intake/sync.service";
import { prisma } from "../lib/prisma";
import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { v80Persist } from "../lib/scaffold/v80/runtime/store";

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
  console.log("V80 Pilot P3 — Tender-to-Plan / Quote Auto-Generation\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({ parseResult: parsed, sourceName: "t.pdf" });

  const sync = buildIntakeSyncPackage(extracted, "org-test");
  assert(Boolean(sync.projectInput.name), "requirements → project mapping");
  assert(Boolean(sync.quoteContent.proposal), "requirements → quote mapping");
  assert(
    (sync.tenderMetadata.requirements as { projectName?: string })?.projectName ===
      extracted.projectName,
    "requirements → tender.metadata preserves fields",
  );
  console.log("✓ single-source requirement mapping");

  const pipelineInput = buildIntakeV80PipelineInput({
    projectId: "proj-bridge-test",
    organizationId: "org-test",
    requirements: extracted,
    session: {
      id: "sess-bridge",
      tenderIntakeId: "intake_bridge",
      fileName: "t.pdf",
      parseResult: parsed,
    },
  });
  assert(pipelineInput.sourceFile === "t.pdf", "bridge maps intake session");
  assert(pipelineInput.parseMeta!.pages >= 1, "bridge maps parse meta");
  console.log("✓ generation bridge input mapping");

  const tenant = await provisionTenant({
    organizationName: "P3 Generation Org",
    plan: "PRO",
    adminEmail: "p3@v80.test",
  });

  await prisma.organization.upsert({
    where: { id: tenant.organizationId },
    create: {
      id: tenant.organizationId,
      name: "P3 Generation Org",
      slug: `p3-gen-${tenant.organizationId.slice(0, 8)}`,
    },
    update: {},
  });

  const session = createIntakeSession({
    organizationId: tenant.organizationId,
    userId: "p3-user",
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

  const approved = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "p3-user",
    userEmail: "p3@v80.test",
    requirements: extracted,
  });
  assert(Boolean(approved.projectId), "project created");
  assert(Boolean(approved.quoteId), "quote generated");
  assert(Boolean(approved.tenderId), "tender created");
  assert(Boolean(approved.workflowJobId), "workflow enqueued");
  assert(approved.workflowStatus === "completed", "tender-pack-complete finished");
  assert(approved.generationPhase === "ready", "generation phase ready");
  console.log("✓ approve → auto-generate → V80 output");

  const again = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "p3-user",
    userEmail: "p3@v80.test",
  });
  assert(again.idempotent === true, "idempotent re-approve");
  assert(again.projectId === approved.projectId, "no duplicate project");
  assert(again.quoteId === approved.quoteId, "no duplicate quote");
  assert(again.tenderId === approved.tenderId, "no duplicate tender");
  console.log("✓ idempotent approve guard");

  const refreshed = updateIntakeSession(session.id, { status: "generating" });
  assert(refreshed?.status === "generating", "session generating state");
  const resumed = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "p3-user",
    userEmail: "p3@v80.test",
  });
  assert(resumed.idempotent === true, "resume generating session");
  console.log("✓ generating session safe re-entry");

  const progress = await getIntakeGenerationProgress(
    updateIntakeSession(session.id, { status: "approved" })!,
  );
  assert(progress.phase === "ready", "generation progress ready");
  assert(Boolean(progress.documentCenterUrl), "progress links");
  console.log("✓ generation progress snapshot");

  const artifacts = await v80Persist.listArtifactsByProject(approved.projectId);
  assert(artifacts.length >= 1, "V80 artifacts from workflow");
  console.log("✓ existing V80 workflow output");

  const tender = await prisma.tender.findUnique({ where: { id: approved.tenderId } });
  const meta = tender?.metadata as Record<string, unknown> | null;
  const metaReq = meta?.requirements as { projectName?: string } | undefined;
  assert(metaReq?.projectName === extracted.projectName, "tender.metadata field preservation");
  console.log("✓ tender.metadata preserves intake requirements");

  console.log("\nPASS — V80 Pilot P3 auto-generation");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
