/**
 * Pilot P8 — Knowledge & Compliance Validation verification
 */
import {
  assertCompliancePassed,
  clearIntakeStoreForTests,
  createIntakeSession,
  evaluateComplianceRules,
  listComplianceRules,
  listIntakeAudit,
  listKnowledgeReferences,
  runIntakeComplianceValidation,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

const FITNESS = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
一、技术需求
1. 有氧区配置跑步机大约若干台。
2. 场地面积不小于 1000 ㎡。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P8 / Knowledge & Compliance Validation ===\n");
  clearIntakeStoreForTests();

  assert(listKnowledgeReferences().length >= 5, "knowledge registry");
  assert(listComplianceRules().length >= 5, "rule catalog");
  console.log("PASS Knowledge reference schema + rule catalog");

  const parsed = await runTenderParserPipeline({
    rawText: FITNESS,
    fileName: "p8.txt",
  });

  // Incomplete + ambiguous fitness package → blocking findings
  const badReq = {
    projectName: "星河健身中心",
    organization: "星河公司",
    industry: "fitness",
    location: "上海",
    objectives: ["建设健身房"],
    scope: "企业健身中心建设",
    functionalRequirements: [],
    technicalRequirements: [
      {
        id: "t1",
        text: "跑步机大约若干台",
        priority: "must" as const,
        reviewStatus: "pending" as const,
      },
    ],
    equipment: [
      {
        id: "e1",
        text: "跑步机大约若干台",
        priority: "must" as const,
      },
    ],
    space: [
      {
        id: "s1",
        text: "场地面积不小于 1000 ㎡",
        priority: "must" as const,
      },
    ],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [],
    budget: { currency: "CNY", notes: "" },
    schedule: { milestones: [] as string[] },
    evaluation: [],
    deliverables: [] as string[],
    risks: [] as string[],
    optionalItems: [],
    sourceRefs: [],
  };

  const report = evaluateComplianceRules({ requirements: badReq });
  assert(!report.passed, "blocked");
  assert(report.blockingCount >= 1, "has blocking");
  assert(
    report.findings.some((f) => f.ruleId === "rule-ambiguous-qty"),
    "ambiguous qty",
  );
  assert(
    report.findings.some((f) => f.ruleId === "rule-standard-mention"),
    "missing standards",
  );
  assert(
    report.findings.some((f) => f.severity === "warning"),
    "has warnings",
  );
  assert(
    ["critical", "high"].includes(report.overallRisk),
    "risk classified",
  );
  console.log("PASS Compliance evaluation + risk classification");

  // Fixed requirements — standards + clear qty + budget + safety
  const goodReq = {
    ...badReq,
    technicalRequirements: [
      {
        id: "t1",
        text: "有氧区配置跑步机不少于 8 台，符合 GB/T 22517 与 GB 17498，保留安全间距",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    equipment: [
      {
        id: "e1",
        text: "跑步机不少于 8 台，含急停与防护",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    standards: [
      {
        id: "st1",
        text: "执行 GB/T 22517.4 与 GB 17498",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    budget: { currency: "CNY", min: 800_000, max: 1_200_000, notes: "含设备安装" },
  };

  const good = evaluateComplianceRules({ requirements: goodReq });
  assert(good.passed, "good passes blocking");
  assert(good.blockingCount === 0, "no blocking");
  console.log("PASS Validation report (pass path)");

  const session = createIntakeSession({
    organizationId: "org-p8",
    userId: "user-p8",
    fileName: "p8.pdf",
    mimeType: "application/pdf",
    fileSize: FITNESS.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    status: "in_review",
    requirements: badReq,
    extractedRequirements: badReq,
    requirementsRevision: 1,
  });

  const ran = runIntakeComplianceValidation({
    sessionId: session.id,
    organizationId: "org-p8",
    actorId: "user-p8",
  });
  assert(!ran.report.passed, "session report blocked");

  let blocked = false;
  try {
    assertCompliancePassed(ran.session);
  } catch (err) {
    blocked = err instanceof Error && err.message === "COMPLIANCE_BLOCKED";
  }
  assert(blocked, "approval gate blocks");

  updateIntakeSession(session.id, { requirements: goodReq });
  const passedRun = runIntakeComplianceValidation({
    sessionId: session.id,
    organizationId: "org-p8",
    actorId: "user-p8",
  });
  assert(passedRun.report.passed, "session pass");
  assertCompliancePassed(updateIntakeSession(session.id, {})!);

  const audits = listIntakeAudit(session.id).filter((e) => e.step === "compliance");
  assert(audits.length >= 2, "compliance audited");
  console.log("PASS Approval gate + review persistence + audit");

  console.log("\n=== ALL P8 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
