/**
 * Pilot P15 — Continuous Improvement Engine verification
 */
import {
  CONTINUOUS_IMPROVEMENT_VERSION,
  acceptKnowledgeRecommendation,
  applyImprovementGovernanceFeedback,
  buildContinuousImprovementReport,
  buildOrgKnowledgeLibrary,
  clearContinuousImprovementStoreForTests,
  clearIntakeStoreForTests,
  clearKnowledgeRecommendationStoreForTests,
  clearOrgKnowledgeStoreForTests,
  createIntakeSession,
  generateKnowledgeRecommendations,
  getOrgKnowledgeGovernanceSnapshot,
  qualityBandFor,
  runTenderParserPipeline,
  scorePatternQuality,
  suggestGovernanceAction,
  updateIntakeSession,
} from "../lib/pilot/v80";
import { saveOrgRecommendationEffectiveness } from "../lib/pilot/v80/intake/knowledge-recommendation.store";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "持续改进测试",
    organization: "Org-P15",
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
    standards: [
      {
        id: "s1",
        text: "符合 GB 17498 固定式健身器材安全要求",
        confidence: 0.85,
        confidenceBand: "high",
      },
    ],
    budget: { currency: "CNY", notes: "约 120 万" },
    schedule: { milestones: [] },
    evaluation: [],
    deliverables: [],
    risks: [],
    optionalItems: [],
    sourceRefs: [],
    ...overrides,
  };
}

async function seedCompleted(org: string, parsed: Awaited<ReturnType<typeof runTenderParserPipeline>>) {
  const s = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "done.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(s.id, {
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
          question: "请确认总预算上限？",
          suggestedTarget: { type: "budget", key: "notes" },
          status: "answered",
          severity: "advisory",
          round: 1,
          answer: "120万",
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
            ruleId: "rule-missing-standard",
            category: "standards",
            severity: "warning",
            risk: "medium",
            title: "缺少标准引用",
            message: "应引用安全标准",
            recommendation: "补充 GB 17498",
          },
        ],
        blockingCount: 0,
        warningCount: 1,
        infoCount: 0,
        overallRisk: "medium",
        passed: true,
        summary: "ok",
      },
    },
  });
  return s;
}

async function main() {
  console.log("=== Pilot P15 / Continuous Improvement Engine ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();
  clearKnowledgeRecommendationStoreForTests();
  clearContinuousImprovementStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：改进\n跑步机 8 台",
    fileName: "p15.txt",
  });
  const org = "org-p15";

  await seedCompleted(org, parsed);
  const s2 = await seedCompleted(org, parsed);
  updateIntakeSession(s2.id, {
    status: "approved",
    signedOff: true,
    requirements: baseRequirements({ projectName: "改进二期" }),
  });

  const library = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "builder" });
  assert(library.patterns.length >= 1, "patterns");

  // 1) Quality scoring
  const excellent = scorePatternQuality({
    shown: 5,
    accepted: 5,
    dismissed: 0,
    authority: "learned",
    status: "active",
  });
  assert(excellent.qualityScore > 0.7, "high quality");
  assert(excellent.confidenceAdjustment > 0, "positive adj");
  assert(qualityBandFor(excellent.qualityScore, 5) !== "poor", "not poor");

  const poor = scorePatternQuality({
    shown: 5,
    accepted: 0,
    dismissed: 5,
    authority: "promoted",
    status: "active",
  });
  assert(poor.qualityScore < 0.5, "low quality");
  assert(poor.confidenceAdjustment <= 0, "negative or zero adj");

  const promoteSug = suggestGovernanceAction({
    shown: 4,
    acceptRate: 0.8,
    dismissed: 0,
    authority: "learned",
    status: "active",
    qualityBand: "excellent",
  });
  assert(promoteSug.action === "promote", "suggest promote");

  const demoteSug = suggestGovernanceAction({
    shown: 4,
    acceptRate: 0.1,
    dismissed: 3,
    authority: "promoted",
    status: "active",
    qualityBand: "poor",
  });
  assert(demoteSug.action === "demote" || demoteSug.action === "deprecate", "suggest demote/deprecate");
  console.log("PASS Knowledge quality scoring + suggestions");

  // 2) Seed effectiveness for a learned equipment pattern → promote candidate
  const equip = library.patterns.find((p) => p.kind === "equipment");
  assert(equip, "equip");
  const clarify = library.patterns.find((p) => p.kind === "clarification");
  assert(clarify, "clarify");

  saveOrgRecommendationEffectiveness({
    organizationId: org,
    updatedAt: new Date().toISOString(),
    events: [
      {
        id: "e1",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r1",
        patternId: equip!.id,
        action: "accepted",
        at: "2026-08-01T10:00:00.000Z",
        actorId: "u1",
      },
      {
        id: "e2",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r2",
        patternId: equip!.id,
        action: "accepted",
        at: "2026-08-02T10:00:00.000Z",
        actorId: "u1",
      },
      {
        id: "e3",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r3",
        patternId: equip!.id,
        action: "accepted",
        at: "2026-08-03T10:00:00.000Z",
        actorId: "u1",
      },
      {
        id: "e4",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r4",
        patternId: clarify!.id,
        action: "dismissed",
        at: "2026-08-03T11:00:00.000Z",
        actorId: "u1",
      },
      {
        id: "e5",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r5",
        patternId: clarify!.id,
        action: "dismissed",
        at: "2026-08-03T12:00:00.000Z",
        actorId: "u1",
      },
      {
        id: "e6",
        organizationId: org,
        sessionId: "s",
        recommendationId: "r6",
        patternId: clarify!.id,
        action: "dismissed",
        at: "2026-08-03T13:00:00.000Z",
        actorId: "u1",
      },
    ],
    byPatternId: {
      [equip!.id]: {
        patternId: equip!.id,
        shown: 4,
        accepted: 3,
        dismissed: 0,
        acceptRate: 0.75,
      },
      [clarify!.id]: {
        patternId: clarify!.id,
        shown: 4,
        accepted: 0,
        dismissed: 3,
        acceptRate: 0,
      },
    },
    totals: {
      shown: 8,
      accepted: 3,
      dismissed: 3,
      acceptRate: 0.38,
    },
  });

  const report = buildContinuousImprovementReport({
    organizationId: org,
    persistAdjustments: true,
  });
  assert(report.version === CONTINUOUS_IMPROVEMENT_VERSION, "version");
  assert(report.aggregation.totalShown === 8, "agg shown");
  assert(report.aggregation.trends.length >= 1, "trends");
  assert(report.quality.length >= 2, "quality rows");
  assert(report.confidenceAdjustments[equip!.id] != null, "adj persisted");

  const equipQ = report.quality.find((q) => q.patternId === equip!.id);
  assert(equipQ?.suggestion.action === "promote", "equip promote suggestion");
  assert(equipQ!.confidenceAdjustment > 0, "equip positive adj");

  const clarifyQ = report.quality.find((q) => q.patternId === clarify!.id);
  assert(
    clarifyQ?.suggestion.action === "deprecate" || clarifyQ?.suggestion.action === "review",
    "clarify weak suggestion",
  );
  console.log("PASS Effectiveness aggregation + report");

  // 3) Governance feedback loop
  const dry = applyImprovementGovernanceFeedback({
    organizationId: org,
    actorId: "improver",
    dryRun: true,
    maxActions: 5,
    patternIds: [equip!.id],
    actions: ["promote"],
  });
  assert(dry.results.length === 1, "dry result");
  assert(dry.results[0]!.dryRun === true, "dry flag");
  assert(
    getOrgKnowledgeGovernanceSnapshot(org)?.entries[equip!.id]?.authority === "learned",
    "not promoted yet",
  );

  const applied = applyImprovementGovernanceFeedback({
    organizationId: org,
    actorId: "improver",
    dryRun: false,
    maxActions: 5,
    patternIds: [equip!.id],
    actions: ["promote"],
    sessionId: s2.id,
  });
  assert(applied.results[0]?.applied === true, "applied");
  assert(
    getOrgKnowledgeGovernanceSnapshot(org)?.entries[equip!.id]?.authority === "promoted",
    "promoted via feedback",
  );
  console.log("PASS Governance feedback integration");

  // 4) Ranking picks up confidence adjustment
  const draft = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "draft.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(draft.id, {
    status: "in_review",
    requirements: baseRequirements({
      projectName: "新评审",
      budget: { currency: "CNY", notes: "" },
      standards: [],
      equipment: [],
      technicalRequirements: [{ id: "t1", text: "待定设备若干", confidence: 0.2 }],
    }),
  });

  const pack = generateKnowledgeRecommendations({
    organizationId: org,
    sessionId: draft.id,
    actorId: "reviewer",
  });
  const equipRec = pack.items.find((i) => i.patternId === equip!.id && i.status === "open");
  if (equipRec) {
    assert(equipRec.effectivenessBoost > 0, "boost from improvement");
  }

  // Accept once more for effectiveness path
  const open = pack.items.find((i) => i.status === "open");
  if (open) {
    acceptKnowledgeRecommendation({
      organizationId: org,
      sessionId: draft.id,
      recommendationId: open.id,
      actorId: "reviewer",
      apply: true,
    });
  }

  const report2 = buildContinuousImprovementReport({ organizationId: org });
  assert(report2.contentHash.length === 64, "hash");
  assert(
    buildContinuousImprovementReport({ organizationId: org }).aggregation.patternsScored ===
      report2.aggregation.patternsScored,
    "deterministic agg",
  );
  console.log("PASS Ranking confidence adjustment + determinism");

  console.log("\n=== ALL P15 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
