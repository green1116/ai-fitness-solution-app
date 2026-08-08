/**
 * Pilot P9 — Intake Summary & Handoff Package verification
 */
import {
  INTAKE_HANDOFF_PACKAGE_VERSION,
  buildIntakeHandoffPackage,
  clearIntakeStoreForTests,
  createIntakeSession,
  exportIntakeHandoffPackageJson,
  generateIntakeHandoffPackage,
  listIntakeAudit,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
一、技术需求
1. 有氧区配置跑步机不少于 8 台，符合 GB/T 22517。
2. 场地面积不小于 1000 ㎡，保留安全间距。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P9 / Intake Summary & Handoff Package ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p9.txt",
  });

  const session = createIntakeSession({
    organizationId: "org-p9",
    userId: "user-p9",
    fileName: "p9-main.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  const requirements = {
    projectName: "星河科技园企业健身中心",
    organization: "星河科技园管理有限公司",
    industry: "fitness",
    location: "上海市浦东新区",
    objectives: ["建设企业健身房"],
    scope: "设备采购与场地布置",
    functionalRequirements: [],
    technicalRequirements: [
      {
        id: "t1",
        text: "有氧区配置跑步机不少于 8 台，符合 GB/T 22517",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
        confidence: 0.9,
        confidenceBand: "high" as const,
        pageRef: "p.1",
        sourceDocumentId: "doc1",
        sourceDocumentName: "p9-main.pdf",
        evidence: [
          {
            page: 1,
            excerpt: "跑步机不少于 8 台",
            documentId: "doc1",
            documentName: "p9-main.pdf",
          },
        ],
      },
    ],
    equipment: [],
    space: [
      {
        id: "s1",
        text: "场地面积不小于 1000 ㎡，保留安全间距",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
        confidence: 0.85,
        confidenceBand: "high" as const,
        sourceDocumentName: "p9-main.pdf",
      },
    ],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [
      {
        id: "st1",
        text: "GB/T 22517",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    budget: { currency: "CNY", min: 500000, max: 900000, notes: "含安装" },
    schedule: { milestones: [] as string[] },
    evaluation: [],
    deliverables: ["方案", "设备清单"],
    risks: [],
    optionalItems: [],
    sourceRefs: [{ page: 1, excerpt: "星河科技园企业健身中心" }],
  };

  updateIntakeSession(session.id, {
    status: "in_review",
    requirements,
    extractedRequirements: requirements,
    requirementsRevision: 3,
    qaPassedAt: new Date().toISOString(),
    documents: [
      {
        id: "doc1",
        fileName: "p9-main.pdf",
        mimeType: "application/pdf",
        fileSize: 10,
        docType: "primary",
        order: 0,
        priority: 80000,
        parseResult: parsed,
        requirements,
        uploadedAt: new Date().toISOString(),
        status: "extracted",
      },
    ],
    consolidation: {
      conflicts: [
        {
          id: "c1",
          listKey: "technicalRequirements",
          kind: "duplicate",
          message: "示例去重",
          loserItemIds: [],
          sourceDocumentIds: ["doc1"],
          resolution: "auto_dedupe",
        },
      ],
      consolidatedAt: new Date().toISOString(),
      documentCount: 1,
      keptItemCount: 2,
      droppedItemCount: 0,
    },
    clarifications: {
      round: 1,
      gaps: [],
      questions: [
        {
          id: "q1",
          gapId: "gap1",
          fieldPath: "budget",
          question: "预算是否含运维？",
          suggestedTarget: { type: "budget", key: "notes" },
          status: "answered",
          severity: "advisory",
          round: 1,
          answer: "含一年维保",
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  });

  const internal = buildIntakeHandoffPackage(
    updateIntakeSession(session.id, {})!,
    "internal",
  );
  assert(internal.version === INTAKE_HANDOFF_PACKAGE_VERSION, "version");
  assert(internal.audience === "internal", "audience internal");
  assert(internal.requirementSummary.projectName.includes("星河"), "summary");
  assert(internal.requirementSummary.withEvidenceCount >= 1, "evidence count");
  assert(internal.traceability.contentHash.length === 64, "hash");
  assert(internal.traceability.evidenceSample.length >= 1, "evidence sample");
  assert(internal.documents.length >= 1, "docs");
  assert(internal.consolidation?.conflicts.length === 1, "conflicts");
  assert(internal.clarifications?.questions.length === 1, "clarify");
  assert(internal.internalNotes.nextActions.length > 0, "internal notes");
  console.log("PASS Handoff package builder (internal)");

  const customer = buildIntakeHandoffPackage(
    updateIntakeSession(session.id, {})!,
    "customer",
  );
  assert(customer.audience === "customer", "customer audience");
  assert(customer.customerBrief.bullets.length >= 3, "customer brief");
  assert(customer.internalNotes.blockers.length === 0, "customer hides internal");
  // customer view strips some internal evidence fields but keeps excerpts
  const custItem = customer.requirements.technicalRequirements[0];
  assert(custItem?.text.includes("跑步机"), "customer reqs");
  assert(custItem?.evidence?.[0]?.excerpt, "customer evidence");
  console.log("PASS Customer / internal views");

  const generated = generateIntakeHandoffPackage({
    sessionId: session.id,
    organizationId: "org-p9",
    actorId: "user-p9",
    audience: "internal",
  });
  assert(generated.handoff.packageId === generated.package.packageId, "persisted id");
  assert(
    updateIntakeSession(session.id, {})!.handoff?.contentHash ===
      generated.package.traceability.contentHash,
    "persisted hash",
  );

  const again = buildIntakeHandoffPackage(updateIntakeSession(session.id, {})!, "internal");
  assert(
    again.traceability.contentHash === generated.package.traceability.contentHash,
    "deterministic hash",
  );
  console.log("PASS Traceability + deterministic consistency");

  const exported = exportIntakeHandoffPackageJson(session.id, "org-p9", "customer");
  assert(exported.fileName.endsWith(".json"), "export name");
  const parsedExport = JSON.parse(exported.body);
  assert(parsedExport.packageId === exported.package.packageId, "export body");
  assert(parsedExport.audience === "customer", "export audience");

  const audits = listIntakeAudit(session.id).filter((e) => e.step === "handoff_package");
  assert(audits.length >= 1, "handoff audited");
  console.log("PASS Export / download payload + audit");

  console.log("\n=== ALL P9 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
