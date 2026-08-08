/**
 * Pilot P11 — Intake Intelligence Analytics verification
 */
import {
  INTAKE_ANALYTICS_VERSION,
  buildIntakeAnalyticsReport,
  clearIntakeStoreForTests,
  createIntakeSession,
  exportIntakeAnalyticsJson,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P11 / Intake Intelligence Analytics ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：分析测试\n跑步机 8 台",
    fileName: "p11.txt",
  });
  const org = "org-p11";

  const a = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "a.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });

  updateIntakeSession(a.id, {
    status: "ready",
    workflowStatus: "completed",
    qaPassedAt: new Date().toISOString(),
    productionProjectId: "p1",
    requirements: {
      projectName: "A",
      organization: "Org",
      industry: "fitness",
      location: "SH",
      objectives: [],
      scope: "scope",
      functionalRequirements: [],
      technicalRequirements: [
        {
          id: "t1",
          text: "跑步机 8 台",
          confidence: 0.9,
          confidenceBand: "high",
          pageRef: "p.1",
          evidence: [{ page: 1, excerpt: "跑步机" }],
        },
        {
          id: "t2",
          text: "待定设备",
          confidence: 0.2,
          confidenceBand: "low",
        },
      ],
      equipment: [],
      space: [],
      quantity: [],
      constraints: [],
      compliance: [],
      standards: [],
      budget: { currency: "CNY", notes: "" },
      schedule: { milestones: [] },
      evaluation: [],
      deliverables: [],
      risks: [],
      optionalItems: [],
      sourceRefs: [],
    },
    clarifications: {
      round: 2,
      gaps: [],
      questions: [
        {
          id: "q1",
          gapId: "g1",
          fieldPath: "budget",
          question: "预算？",
          suggestedTarget: { type: "budget", key: "notes" },
          status: "answered",
          severity: "advisory",
          round: 1,
          answer: "100万",
        },
        {
          id: "q2",
          gapId: "g2",
          fieldPath: "location",
          question: "地点？",
          suggestedTarget: { type: "scalar", key: "location" },
          status: "open",
          severity: "blocking",
          round: 2,
        },
      ],
      updatedAt: new Date().toISOString(),
    },
    compliance: {
      acknowledgedFindingIds: [],
      updatedAt: new Date().toISOString(),
      report: {
        evaluatedAt: new Date().toISOString(),
        knowledgeRefCount: 1,
        ruleCount: 1,
        findings: [
          {
            id: "f1",
            ruleId: "rule-ambiguous-qty",
            category: "consistency",
            severity: "blocking",
            risk: "critical",
            title: "数量含糊",
            message: "待定",
            recommendation: "明确数量",
          },
        ],
        blockingCount: 1,
        warningCount: 0,
        infoCount: 0,
        overallRisk: "critical",
        passed: false,
        summary: "blocked",
      },
    },
    documents: [
      {
        id: "d1",
        fileName: "a.pdf",
        mimeType: "application/pdf",
        fileSize: 1,
        docType: "primary",
        order: 0,
        priority: 80,
        parseResult: parsed,
        uploadedAt: new Date().toISOString(),
        status: "extracted",
      },
      {
        id: "d2",
        fileName: "补遗.pdf",
        mimeType: "application/pdf",
        fileSize: 1,
        docType: "addendum",
        order: 1,
        priority: 100,
        parseResult: parsed,
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
          message: "dup",
          loserItemIds: [],
          sourceDocumentIds: ["d1", "d2"],
          resolution: "auto_dedupe",
        },
      ],
      consolidatedAt: new Date().toISOString(),
      documentCount: 2,
      keptItemCount: 2,
      droppedItemCount: 1,
    },
    bootstrap: {
      bootstrapId: "boot1",
      contentHash: "b".repeat(64),
      builtAt: new Date().toISOString(),
      projectId: "p1",
      package: {
        version: "v80-pilot-p10-bootstrap-1",
        bootstrapId: "boot1",
        contentHash: "b".repeat(64),
        builtAt: new Date().toISOString(),
        organizationId: org,
        sessionId: a.id,
        tenderIntakeId: a.tenderIntakeId,
        projectId: "p1",
        owners: [{ role: "project_manager", label: "PM", displayName: "pm" }],
        milestones: [
          {
            id: "ms1",
            title: "Kickoff",
            description: "",
            status: "planned",
            ownerRole: "project_manager",
            dueOffsetDays: 3,
            order: 1,
          },
        ],
        tasks: [
          {
            id: "tk1",
            milestoneId: "ms1",
            title: "Task",
            description: "",
            ownerRole: "project_manager",
            status: "todo",
            source: "system",
            dueOffsetDays: 2,
          },
        ],
        kickoff: {
          projectName: "A",
          clientName: "Org",
          location: "SH",
          milestoneCount: 1,
          taskCount: 1,
          ownerCount: 1,
          ready: true,
          headline: "ready",
          bullets: [],
          risks: [],
          nextActions: [],
        },
        traceability: {
          intakeRevision: 1,
          sourceDocuments: [],
          requirementItemCount: 2,
        },
      },
    },
  });

  const b = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "b.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(b.id, { status: "in_review" });

  const report = buildIntakeAnalyticsReport({ organizationId: org });
  assert(report.version === INTAKE_ANALYTICS_VERSION, "version");
  assert(report.kpis.totalSessions === 2, "two sessions");
  assert(report.kpis.byStatus.ready === 1, "ready count");
  assert(report.kpis.byStatus.in_review === 1, "review count");
  assert(report.kpis.withProjectRate === 0.5, "project rate");
  assert(report.kpis.duration.sampleSize >= 1, "duration sample");
  assert(report.kpis.clarifications.answered === 1, "clarify answered");
  assert(report.kpis.clarifications.blockingOpen === 1, "clarify blocking");
  assert(report.kpis.confidence.high === 1, "conf high");
  assert(report.kpis.confidence.low === 1, "conf low");
  assert(report.kpis.confidence.withEvidence === 1, "with evidence");
  assert(report.kpis.compliance.blocked === 1, "compliance blocked");
  assert(report.kpis.documents.multiDocSessions === 1, "multi doc");
  assert(report.kpis.documents.byDocType.addendum === 1, "addendum");
  assert(report.kpis.documents.conflictCount === 1, "conflicts");
  assert(report.kpis.bootstrap.sessionsWithBootstrap === 1, "bootstrap");
  assert(report.kpis.bootstrap.readyCount === 1, "bootstrap ready");
  assert(report.trends.length >= 1, "trends");
  console.log("PASS KPI aggregation + distributions + trends");

  const k2 = buildIntakeAnalyticsReport({ organizationId: org }).kpis;
  assert(k2.totalSessions === report.kpis.totalSessions, "stable total");
  assert(k2.confidence.high === report.kpis.confidence.high, "stable confidence");
  assert(k2.documents.conflictCount === report.kpis.documents.conflictCount, "stable docs");
  console.log("PASS Deterministic aggregation");

  const exported = exportIntakeAnalyticsJson(report);
  assert(exported.fileName.endsWith(".json"), "export name");
  assert(JSON.parse(exported.body).kpis.totalSessions === 2, "export body");
  console.log("PASS Export payload");

  console.log("\n=== ALL P11 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
