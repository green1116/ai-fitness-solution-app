/**
 * Pilot P12 — Organization Knowledge Learning verification
 */
import {
  ORG_KNOWLEDGE_VERSION,
  buildOrgKnowledgeLibrary,
  clearIntakeStoreForTests,
  clearOrgKnowledgeStoreForTests,
  createIntakeSession,
  exportOrgKnowledgeJson,
  getOrgKnowledgeSnapshot,
  lookupOrgKnowledgeRecommendations,
  rebuildOrgKnowledgeLibrary,
  runTenderParserPipeline,
  updateIntakeSession,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "知识学习测试",
    organization: "Org-P12",
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
  console.log("=== Pilot P12 / Organization Knowledge Learning ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：知识学习\n跑步机 8 台",
    fileName: "p12.txt",
  });
  const org = "org-p12";

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
    productionProjectId: "proj-p12",
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
            message: "健身器械应引用安全标准",
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

  // Second completed session with overlapping patterns
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
    requirements: baseRequirements({
      projectName: "知识学习二期",
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
    }),
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
            message: "健身器械应引用安全标准",
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

  // Incomplete session should not be a knowledge source
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
    requirements: baseRequirements({ projectName: "草稿勿学" }),
  });

  const library = buildOrgKnowledgeLibrary({ organizationId: org });
  assert(library.version === ORG_KNOWLEDGE_VERSION, "version");
  assert(library.sourceSessionCount === 2, "only completed sessions");
  assert(library.patterns.length >= 3, "patterns extracted");
  assert(library.summary.equipmentPatterns >= 1, "equipment patterns");
  assert(library.summary.clarificationPatterns >= 1, "clarification patterns");
  assert(library.summary.compliancePatterns >= 1, "compliance patterns");
  assert(library.summary.standardPatterns >= 1, "standard patterns");
  assert(library.contentHash.length === 64, "hash length");

  const equip = library.patterns.find((p) => p.kind === "equipment");
  assert(equip && equip.frequency === 2, "equipment frequency across sessions");
  const clarify = library.patterns.find((p) => p.kind === "clarification");
  assert(clarify && clarify.frequency === 2, "clarify frequency");
  const compliance = library.patterns.find((p) => p.kind === "compliance");
  assert(compliance?.key === "rule-missing-standard", "compliance rule id key");
  console.log("PASS Knowledge schema + builder + pattern aggregation");

  const snap = getOrgKnowledgeSnapshot(org);
  assert(snap?.contentHash === library.contentHash, "store snapshot");

  const rebuilt = rebuildOrgKnowledgeLibrary({
    organizationId: org,
    sessionId: completed.id,
    actorId: "tester",
  });
  assert(rebuilt.contentHash === library.contentHash, "deterministic rebuild hash");
  console.log("PASS Persist + deterministic rebuild");

  // New review context: fitness, no standards, no budget, sparse equipment
  const lookup = lookupOrgKnowledgeRecommendations({
    organizationId: org,
    sessionId: draft.id,
    requirements: {
      ...baseRequirements({
        projectName: "新项目评审",
        budget: { currency: "CNY", notes: "" },
        standards: [],
        equipment: [],
        technicalRequirements: [{ id: "t1", text: "待定设备若干", confidence: 0.2 }],
      }),
    },
    limit: 10,
  });
  assert(lookup.recommendations.length >= 1, "has recommendations");
  assert(
    lookup.recommendations.some((r) => r.kind === "standard" || r.kind === "clarification"),
    "standard or clarification rec",
  );
  assert(
    lookup.recommendations.every((r) => r.confidence > 0 && r.suggestion),
    "rec fields",
  );
  console.log("PASS Recommendation lookup");

  const exported = exportOrgKnowledgeJson(library);
  assert(exported.fileName.includes("org-knowledge"), "export name");
  assert(JSON.parse(exported.body).sourceSessionCount === 2, "export body");
  console.log("PASS Export payload");

  // Other org isolation
  const other = buildOrgKnowledgeLibrary({ organizationId: "org-other" });
  assert(other.sourceSessionCount === 0, "org isolation");
  assert(other.patterns.length === 0, "empty other org");
  console.log("PASS Org isolation");

  console.log("\n=== ALL P12 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
