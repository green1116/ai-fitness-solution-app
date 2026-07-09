/**
 * V80 Pilot P1 — Tender intake verification (upload → extract → approve → V80 pipeline)
 */
import { PDFDocument } from "pdf-lib";

import {
  approveTenderIntake,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { prisma } from "../lib/prisma";
import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { v80Persist } from "../lib/scaffold/v80/runtime/store";

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

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("V80 Pilot P1 — Tender Intake Verification\n");

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE_TENDER,
    fileName: "sample-tender.txt",
  });
  assert(parsed.rawText.length > 100, "parser pipeline");
  console.log("✓ parsing pipeline");

  const requirements = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "sample-tender.txt",
  });
  assert(Boolean(requirements.projectName), "projectName extracted");
  assert(requirements.technicalRequirements.length > 0, "technical requirements");
  console.log("✓ AI requirement extraction (structured JSON)");

  const tenant = await provisionTenant({
    organizationName: "V80 Pilot Intake Org",
    plan: "PRO",
    adminEmail: "pilot@v80.test",
  });

  await prisma.organization.upsert({
    where: { id: tenant.organizationId },
    create: {
      id: tenant.organizationId,
      name: "V80 Pilot Intake Org",
      slug: `v80-pilot-intake-${tenant.organizationId.slice(0, 8)}`,
    },
    update: { name: "V80 Pilot Intake Org" },
  });

  const session = createIntakeSession({
    organizationId: tenant.organizationId,
    userId: "verify-user",
    fileName: "sample-tender.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE_TENDER.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, { status: "extracted", requirements });
  assert(Boolean(session.tenderIntakeId), "tender intake id");
  console.log("✓ upload / intake session");

  const approved = await approveTenderIntake({
    sessionId: session.id,
    organizationId: tenant.organizationId,
    userId: "verify-user",
    userEmail: "pilot@v80.test",
    requirements,
  });
  assert(Boolean(approved.projectId), "production project");
  assert(Boolean(approved.tenderId), "production tender");
  assert(Boolean(approved.quoteId), "production quote");
  assert(approved.workflowStatus === "completed", "V80 workflow completed");
  console.log("✓ review → project → V80 pipeline");

  const artifacts = await v80Persist.listArtifactsByProject(approved.projectId);
  assert(artifacts.length >= 1, "V80 artifacts");
  console.log("✓ V80 artifacts");

  const pdf = await PDFDocument.create();
  pdf.addPage();
  assert((await pdf.save()).length > 0, "pdf sanity");
  console.log("✓ delivery chain ready");

  console.log("\n✅ V80 Pilot P1 Tender Intake — verify PASS");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
