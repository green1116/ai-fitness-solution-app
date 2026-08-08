/**
 * Pilot P14 — Knowledge Recommendation Engine verification
 */
import {
  KNOWLEDGE_RECOMMENDATION_VERSION,
  acceptKnowledgeRecommendation,
  buildOrgKnowledgeLibrary,
  clearIntakeStoreForTests,
  clearKnowledgeRecommendationStoreForTests,
  clearOrgKnowledgeStoreForTests,
  computeRankScore,
  createIntakeSession,
  dismissKnowledgeRecommendation,
  generateKnowledgeRecommendations,
  getIntakeSession,
  getRecommendationEffectiveness,
  jaccardSimilarity,
  promoteOrgKnowledgePattern,
  tokenizeForSimilarity,
  updateIntakeSession,
  runTenderParserPipeline,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "推荐引擎测试",
    organization: "Org-P14",
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

async function main() {
  console.log("=== Pilot P14 / Knowledge Recommendation Engine ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();
  clearKnowledgeRecommendationStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：推荐\n跑步机 8 台",
    fileName: "p14.txt",
  });
  const org = "org-p14";

  const completed = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "done.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(completed.id, {
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

  const completed2 = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "done2.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(completed2.id, {
    status: "approved",
    signedOff: true,
    requirements: baseRequirements({ projectName: "推荐二期" }),
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
          answer: "150万",
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

  const library = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "builder" });
  const equip = library.patterns.find((p) => p.kind === "equipment");
  assert(equip, "equip pattern");
  promoteOrgKnowledgePattern({
    organizationId: org,
    patternId: equip!.id,
    actorId: "reviewer",
    note: "标准规格",
  });

  // Similarity + ranking
  const a = tokenizeForSimilarity("跑步机 8 台 功率≥3.0HP");
  const b = tokenizeForSimilarity("跑步机商业级 功率 3.0HP");
  const sim = jaccardSimilarity(a, b);
  assert(sim > 0, "similarity positive");
  const high = computeRankScore({
    similarity: 0.8,
    trustScore: 0.9,
    frequencyNorm: 1,
    categoryBoost: 1,
    effectivenessBoost: 0.5,
  });
  const low = computeRankScore({
    similarity: 0.1,
    trustScore: 0.2,
    frequencyNorm: 0.1,
    categoryBoost: 0.2,
    effectivenessBoost: 0,
  });
  assert(high > low, "rank ordering");
  assert(
    computeRankScore({
      similarity: 0.5,
      trustScore: 0.5,
      frequencyNorm: 0.5,
      categoryBoost: 0.5,
      effectivenessBoost: 0.5,
    }) ===
      computeRankScore({
        similarity: 0.5,
        trustScore: 0.5,
        frequencyNorm: 0.5,
        categoryBoost: 0.5,
        effectivenessBoost: 0.5,
      }),
    "deterministic rank",
  );
  console.log("PASS Similarity matching + ranking strategy");

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
    limit: 10,
  });
  assert(pack.version === KNOWLEDGE_RECOMMENDATION_VERSION, "version");
  assert(pack.items.length >= 1, "has items");
  assert(pack.ranking.strategy === "weighted_similarity_trust_v1", "strategy");
  assert(
    pack.items.every((i) => typeof i.rankScore === "number" && i.primary),
    "ranked fields",
  );
  assert(
    pack.items.some((i) =>
      ["requirement_template", "clarification", "compliance", "equipment_spec", "best_practice", "alternative"].includes(
        i.category,
      ),
    ),
    "categories",
  );
  const openSorted = pack.items.filter((i) => i.status === "open");
  for (let i = 1; i < openSorted.length; i++) {
    assert(openSorted[i - 1]!.rankScore >= openSorted[i]!.rankScore, "sorted by rank");
  }
  console.log("PASS Recommendation schema + service generation");

  // Accept applies to requirements
  const target =
    pack.items.find((i) => i.status === "open" && i.category === "equipment_spec") ||
    pack.items.find((i) => i.status === "open" && i.relatedFieldPath === "equipment") ||
    pack.items.find((i) => i.status === "open" && i.relatedFieldPath === "standards") ||
    pack.items.find((i) => i.status === "open");
  assert(target, "open target");

  const accepted = acceptKnowledgeRecommendation({
    organizationId: org,
    sessionId: draft.id,
    recommendationId: target!.id,
    actorId: "reviewer",
    apply: true,
  });
  assert(accepted.pack.summary.accepted >= 1, "accepted count");
  assert(
    accepted.pack.items.find((i) => i.id === target!.id)?.status === "accepted",
    "status accepted",
  );
  const sessionAfter = getIntakeSession(draft.id)!;
  if (accepted.applied) {
    assert(sessionAfter.requirements, "requirements updated");
  }
  console.log("PASS Accept + optional apply");

  // Dismiss another
  const pack2 = generateKnowledgeRecommendations({
    organizationId: org,
    sessionId: draft.id,
    actorId: "reviewer",
  });
  const other = pack2.items.find((i) => i.status === "open" && i.id !== target!.id);
  if (other) {
    const dismissed = dismissKnowledgeRecommendation({
      organizationId: org,
      sessionId: draft.id,
      recommendationId: other.id,
      actorId: "reviewer",
      reason: "not_relevant",
    });
    assert(
      dismissed.items.find((i) => i.id === other.id)?.status === "dismissed",
      "dismissed",
    );
    // Regenerated pack should keep dismissed
    const pack3 = generateKnowledgeRecommendations({
      organizationId: org,
      sessionId: draft.id,
      actorId: "reviewer",
    });
    assert(
      pack3.items.find((i) => i.id === other.id)?.status === "dismissed",
      "dismiss persisted",
    );
  }
  console.log("PASS Dismiss + persistence");

  const eff = getRecommendationEffectiveness(org);
  assert(eff.totals.shown >= 1, "effectiveness shown");
  assert(eff.totals.accepted >= 1, "effectiveness accepted");
  assert(eff.byPatternId[target!.patternId]?.accepted >= 1, "pattern stats");
  console.log("PASS Effectiveness tracking");

  console.log("\n=== ALL P14 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
