/**
 * Pilot P18 — Enterprise Decision Support verification
 */
import {
  ENTERPRISE_DECISION_VERSION,
  buildEnterpriseDecisionReport,
  buildOrgKnowledgeLibrary,
  clearContinuousImprovementStoreForTests,
  clearIntakeStoreForTests,
  clearKnowledgeRecommendationStoreForTests,
  clearOrgKnowledgeStoreForTests,
  createIntakeSession,
  exportEnterpriseDecisionJson,
  getIntakeSession,
  getSessionDecisionSnapshot,
  healthBandFor,
  promoteOrgKnowledgePattern,
  runTenderParserPipeline,
  scoreDeliveryRisk,
  scoreProjectReadiness,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { saveOrgRecommendationEffectiveness } from "../lib/pilot/v80/intake/knowledge-recommendation.store";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "决策测试",
    organization: "Org-P18",
    industry: "fitness",
    location: "上海",
    objectives: [],
    scope: "健身房建设",
    functionalRequirements: [],
    technicalRequirements: [
      {
        id: "t1",
        text: "跑步机商业级连续运行8小时",
        confidence: 0.9,
        confidenceBand: "high",
        evidence: [{ page: 1, excerpt: "跑步机" }],
      },
    ],
    equipment: [
      {
        id: "e1",
        text: "跑步机 8 台 功率≥3.0HP",
        confidence: 0.9,
        confidenceBand: "high",
      },
    ],
    space: [],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [{ id: "s1", text: "符合 GB 17498", confidence: 0.8, confidenceBand: "high" }],
    budget: { currency: "CNY", notes: "100万" },
    schedule: { milestones: [] },
    evaluation: [],
    deliverables: [],
    risks: [],
    optionalItems: [],
    sourceRefs: [],
    ...overrides,
  };
}

async function main() {
  console.log("=== Pilot P18 / Enterprise Decision Support ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();
  clearKnowledgeRecommendationStoreForTests();
  clearContinuousImprovementStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：决策\n跑步机 8 台",
    fileName: "p18.txt",
  });
  const org = "org-p18";

  const ready = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "ready.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(ready.id, {
    status: "ready",
    workflowStatus: "completed",
    qaPassedAt: new Date().toISOString(),
    productionProjectId: "p-ready",
    requirements: baseRequirements({ projectName: "已完成健身房" }),
    clarifications: {
      round: 1,
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
        findings: [],
        blockingCount: 0,
        warningCount: 0,
        infoCount: 0,
        overallRisk: "none",
        passed: true,
        summary: "ok",
      },
    },
    bootstrap: {
      bootstrapId: "b1",
      contentHash: "d".repeat(64),
      builtAt: new Date().toISOString(),
      projectId: "p-ready",
      package: {
        version: "v80-pilot-p10-bootstrap-1",
        bootstrapId: "b1",
        contentHash: "d".repeat(64),
        builtAt: new Date().toISOString(),
        organizationId: org,
        sessionId: ready.id,
        tenderIntakeId: ready.tenderIntakeId,
        projectId: "p-ready",
        owners: [{ role: "project_manager", label: "PM", displayName: "pm" }],
        milestones: [
          {
            id: "m1",
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
            id: "t1",
            milestoneId: "m1",
            title: "Task",
            description: "",
            ownerRole: "project_manager",
            status: "todo",
            source: "system",
            dueOffsetDays: 2,
          },
        ],
        kickoff: {
          projectName: "已完成健身房",
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

  const risky = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "risk.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(risky.id, {
    status: "in_review",
    requirements: baseRequirements({
      projectName: "高风险草稿",
      standards: [],
      equipment: [],
      technicalRequirements: [{ id: "t1", text: "待定设备若干", confidence: 0.2 }],
    }),
    clarifications: {
      round: 2,
      gaps: [],
      questions: [
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
  });

  const library = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "builder" });
  const equip = library.patterns.find((p) => p.kind === "equipment");
  if (equip) {
    promoteOrgKnowledgePattern({
      organizationId: org,
      patternId: equip.id,
      actorId: "reviewer",
    });
  }
  saveOrgRecommendationEffectiveness({
    organizationId: org,
    updatedAt: new Date().toISOString(),
    events: [],
    byPatternId: {},
    totals: { shown: 10, accepted: 7, dismissed: 3, acceptRate: 0.7 },
  });

  assert(healthBandFor(80) === "healthy", "healthy band");
  assert(healthBandFor(20) === "critical", "critical band");

  const snapReady = getSessionDecisionSnapshot({ organizationId: org, sessionId: ready.id });
  const snapRisk = getSessionDecisionSnapshot({ organizationId: org, sessionId: risky.id });
  assert(snapReady.readiness.score > snapRisk.readiness.score, "ready > risky readiness");
  assert(snapRisk.risk.score > snapReady.risk.score, "risky > ready risk");
  assert(scoreProjectReadiness(getIntakeSession(ready.id)!).sessionId === ready.id, "readiness fn");
  assert(scoreDeliveryRisk(getIntakeSession(risky.id)!).sessionId === risky.id, "risk fn");
  console.log("PASS Readiness + delivery risk scoring");

  const report = buildEnterpriseDecisionReport({ organizationId: org });
  assert(report.version === ENTERPRISE_DECISION_VERSION, "version");
  assert(report.executiveScorecard.overallHealth >= 0, "health");
  assert(report.executiveScorecard.band.length > 0, "band");
  assert(report.projectReadiness.length >= 1, "readiness rows");
  assert(report.deliveryRisks.length >= 1, "risk rows");
  assert(report.recommendations.length >= 1, "recommendations");
  assert(report.investmentPriorities.length >= 1, "investment");
  assert(report.narrative.headline.length > 0, "narrative");
  assert(report.narrative.nextSteps.length >= 1, "next steps");
  assert(report.contentHash.length === 64, "hash");
  assert(report.sources.sessionCount === 2, "sessions");
  console.log("PASS Decision report composition");

  const again = buildEnterpriseDecisionReport({ organizationId: org });
  assert(again.executiveScorecard.overallHealth === report.executiveScorecard.overallHealth, "deterministic");
  assert(
    again.recommendations.map((r) => r.id).join(",") ===
      report.recommendations.map((r) => r.id).join(","),
    "deterministic recs",
  );
  console.log("PASS Determinism");

  const exported = exportEnterpriseDecisionJson(report);
  assert(exported.fileName.includes("enterprise-decision"), "export name");
  assert(JSON.parse(exported.body).executiveScorecard.overallHealth === report.executiveScorecard.overallHealth, "export body");
  console.log("PASS Export API payload");

  const empty = buildEnterpriseDecisionReport({ organizationId: "org-empty-p18" });
  assert(empty.sources.sessionCount === 0, "empty org");
  console.log("PASS Org isolation");

  console.log("\n=== ALL P18 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
