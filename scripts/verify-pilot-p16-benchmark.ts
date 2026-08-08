/**
 * Pilot P16 — Organization Benchmark Platform verification
 */
import {
  ORG_BENCHMARK_VERSION,
  assessMaturity,
  bandForScore,
  buildOrgBenchmarkReport,
  buildOrgKnowledgeLibrary,
  clearContinuousImprovementStoreForTests,
  clearIntakeStoreForTests,
  clearKnowledgeRecommendationStoreForTests,
  clearOrgKnowledgeStoreForTests,
  createIntakeSession,
  detectBenchmarkOpportunities,
  exportOrgBenchmarkJson,
  percentileVsTarget,
  promoteOrgKnowledgePattern,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { saveOrgRecommendationEffectiveness } from "../lib/pilot/v80/intake/knowledge-recommendation.store";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "对标测试",
    organization: "Org-P16",
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
        confidence: 0.85,
        confidenceBand: "high",
      },
    ],
    space: [],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [
      {
        id: "s1",
        text: "符合 GB 17498",
        confidence: 0.8,
        confidenceBand: "high",
      },
    ],
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
  console.log("=== Pilot P16 / Organization Benchmark Platform ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();
  clearKnowledgeRecommendationStoreForTests();
  clearContinuousImprovementStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：对标\n跑步机 8 台",
    fileName: "p16.txt",
  });
  const org = "org-p16";

  const ready = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "a.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(ready.id, {
    status: "ready",
    workflowStatus: "completed",
    qaPassedAt: new Date().toISOString(),
    productionProjectId: "p1",
    requirements: baseRequirements(),
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
      contentHash: "a".repeat(64),
      builtAt: new Date().toISOString(),
      projectId: "p1",
      package: {
        version: "v80-pilot-p10-bootstrap-1",
        bootstrapId: "b1",
        contentHash: "a".repeat(64),
        builtAt: new Date().toISOString(),
        organizationId: org,
        sessionId: ready.id,
        tenderIntakeId: ready.tenderIntakeId,
        projectId: "p1",
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
          projectName: "对标",
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

  const review = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "b.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(review.id, {
    status: "in_review",
    requirements: baseRequirements({
      projectName: "在审",
      technicalRequirements: [
        { id: "t1", text: "待定设备", confidence: 0.2, confidenceBand: "low" },
      ],
      standards: [],
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
    byPatternId: equip
      ? {
          [equip.id]: {
            patternId: equip.id,
            shown: 5,
            accepted: 4,
            dismissed: 1,
            acceptRate: 0.8,
          },
        }
      : {},
    totals: {
      shown: 5,
      accepted: 4,
      dismissed: 1,
      acceptRate: 0.8,
    },
  });

  // Unit helpers
  assert(bandForScore(90) === "leading", "band leading");
  assert(bandForScore(50) === "lagging" || bandForScore(50) === "average", "band mid");
  assert(percentileVsTarget(70, 70) === 60, "pct at target");
  assert(percentileVsTarget(87.5, 70) > 60, "pct above target");
  console.log("PASS Schema helpers (band / percentile)");

  const report = buildOrgBenchmarkReport({ organizationId: org });
  assert(report.version === ORG_BENCHMARK_VERSION, "version");
  assert(report.window.sessionCount === 2, "sessions");
  assert(report.scorecard.categories.length === 8, "8 categories");
  assert(report.scorecard.overallScore >= 0 && report.scorecard.overallScore <= 100, "overall");
  assert(report.scorecard.overallPercentile >= 1 && report.scorecard.overallPercentile <= 99, "pct");
  assert(report.maturity.level.length > 0, "maturity");
  assert(report.maturity.criteriaMet.length + report.maturity.criteriaMissed.length >= 1, "criteria");
  assert(Array.isArray(report.opportunities), "opportunities");
  assert(report.sources.knowledgePatternCount >= 1, "knowledge source");
  assert(report.contentHash.length === 64, "hash");
  console.log("PASS Scorecard + maturity + sources");

  const maturity = assessMaturity(report.scorecard.overallScore, report.scorecard.categories);
  assert(maturity.level === report.maturity.level, "maturity stable");
  const opps = detectBenchmarkOpportunities(report.scorecard.categories, maturity);
  assert(opps.every((o) => o.impactScore >= 0 && o.recommendedAction), "opp fields");
  console.log("PASS Maturity assessment + opportunity detector");

  const again = buildOrgBenchmarkReport({ organizationId: org });
  assert(again.scorecard.overallScore === report.scorecard.overallScore, "deterministic score");
  assert(
    again.scorecard.categories.map((c) => c.score).join(",") ===
      report.scorecard.categories.map((c) => c.score).join(","),
    "deterministic categories",
  );
  console.log("PASS Deterministic report");

  const exported = exportOrgBenchmarkJson(report);
  assert(exported.fileName.includes("org-benchmark"), "export name");
  assert(JSON.parse(exported.body).scorecard.overallScore === report.scorecard.overallScore, "export body");
  console.log("PASS Export payload");

  // Empty org isolation
  const empty = buildOrgBenchmarkReport({ organizationId: "org-empty-p16" });
  assert(empty.window.sessionCount === 0, "empty sessions");
  assert(empty.scorecard.categories.length === 8, "still 8 cats");
  console.log("PASS Org isolation");

  console.log("\n=== ALL P16 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
