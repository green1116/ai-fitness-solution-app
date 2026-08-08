/**
 * Pilot P17 — Cross-Project Intelligence verification
 */
import {
  CROSS_PROJECT_VERSION,
  buildCrossProjectExplorer,
  buildProjectFingerprint,
  clearIntakeStoreForTests,
  clearOrgKnowledgeStoreForTests,
  createIntakeSession,
  exportCrossProjectJson,
  findSimilarProjects,
  getIntakeSession,
  runTenderParserPipeline,
  scoreFingerprintSimilarity,
  updateIntakeSession,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "跨项目甲",
    organization: "Org-P17",
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
    budget: { currency: "CNY", notes: "120万" },
    schedule: { milestones: [] },
    evaluation: [],
    deliverables: [],
    risks: [],
    optionalItems: [],
    sourceRefs: [],
    ...overrides,
  };
}

function markCompleted(sessionId: string, requirements: Record<string, unknown>) {
  updateIntakeSession(sessionId, {
    status: "ready",
    workflowStatus: "completed",
    qaPassedAt: new Date().toISOString(),
    productionProjectId: `proj-${sessionId.slice(0, 6)}`,
    requirements: requirements as never,
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
    bootstrap: {
      bootstrapId: "boot1",
      contentHash: "c".repeat(64),
      builtAt: new Date().toISOString(),
      projectId: `proj-${sessionId.slice(0, 6)}`,
      package: {
        version: "v80-pilot-p10-bootstrap-1",
        bootstrapId: "boot1",
        contentHash: "c".repeat(64),
        builtAt: new Date().toISOString(),
        organizationId: "org-p17",
        sessionId,
        tenderIntakeId: "tid",
        projectId: `proj-${sessionId.slice(0, 6)}`,
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
            title: "场地复核",
            description: "",
            ownerRole: "project_manager",
            status: "todo",
            source: "system",
            dueOffsetDays: 2,
          },
        ],
        kickoff: {
          projectName: String(requirements.projectName ?? "x"),
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
}

async function main() {
  console.log("=== Pilot P17 / Cross-Project Intelligence ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：跨项目\n跑步机 8 台",
    fileName: "p17.txt",
  });
  const org = "org-p17";

  const a = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "a.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  markCompleted(a.id, baseRequirements({ projectName: "跨项目甲" }));

  const b = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "b.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  markCompleted(
    b.id,
    baseRequirements({
      projectName: "跨项目乙",
      location: "上海浦东",
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
          text: "跑步机 10 台 功率≥3.0HP",
          confidence: 0.9,
          confidenceBand: "high",
        },
      ],
    }),
  );

  const unrelated = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "c.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  markCompleted(
    unrelated.id,
    baseRequirements({
      projectName: "办公装修",
      industry: "office",
      location: "北京",
      scope: "办公区改造",
      technicalRequirements: [{ id: "t1", text: "隔断墙", confidence: 0.5 }],
      equipment: [{ id: "e1", text: "工位桌椅 50 套", confidence: 0.5 }],
      standards: [],
    }),
  );

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
      projectName: "新健身房 Intake",
      equipment: [],
      standards: [],
      technicalRequirements: [{ id: "t1", text: "待定跑步机若干", confidence: 0.2 }],
    }),
  });

  // Fingerprint
  const sa = getIntakeSession(a.id)!;
  const fpA = buildProjectFingerprint(sa);
  assert(fpA.sessionId === a.id, "fp session");
  assert(fpA.tokens.length > 0, "tokens");
  assert(fpA.contentHash.length === 64, "fp hash");
  const fpA2 = buildProjectFingerprint(sa);
  assert(fpA.contentHash === fpA2.contentHash, "deterministic fingerprint");
  console.log("PASS Project fingerprint service");

  // Scoring
  const fpB = buildProjectFingerprint(getIntakeSession(b.id)!);
  const fpU = buildProjectFingerprint(getIntakeSession(unrelated.id)!);
  const simAB = scoreFingerprintSimilarity(fpA, fpB);
  const simAU = scoreFingerprintSimilarity(fpA, fpU);
  assert(simAB.similarity > simAU.similarity, "fitness closer than office");
  assert(simAB.dimensions.length === 8, "8 dimensions");
  assert(
    scoreFingerprintSimilarity(fpA, fpB).similarity === simAB.similarity,
    "deterministic score",
  );
  console.log("PASS Similarity scoring");

  // Retrieval + reuse + comparison + insight
  const report = findSimilarProjects({
    organizationId: org,
    sessionId: draft.id,
    limit: 5,
  });
  assert(report.version === CROSS_PROJECT_VERSION, "version");
  assert(report.matches.length >= 1, "has matches");
  assert(report.matches[0]!.similarity >= report.matches.at(-1)!.similarity, "sorted");
  assert(
    report.matches.some((m) => m.sessionId === a.id || m.sessionId === b.id),
    "finds fitness projects",
  );
  assert(report.reuseArtifacts.length >= 1, "reuse artifacts");
  assert(
    report.reuseArtifacts.some((r) =>
      ["equipment", "requirement", "clarification", "compliance", "execution", "standard"].includes(
        r.kind,
      ),
    ),
    "artifact kinds",
  );
  assert(report.comparison, "comparison view");
  assert(report.comparison!.rows.length >= 5, "comparison rows");
  assert(report.insight.headline.length > 0, "insight");
  assert(report.contentHash.length === 64, "report hash");
  console.log("PASS Similar retrieval + reuse + comparison + insight");

  const explorer = buildCrossProjectExplorer({ organizationId: org });
  assert(explorer.fingerprints.length === 3, "3 historical fps");
  assert(explorer.topPairs.length >= 1, "pairs");
  assert(explorer.insight.projectCount === 3, "insight count");
  console.log("PASS Similar project explorer");

  const exported = exportCrossProjectJson(report);
  assert(exported.fileName.includes("cross-project"), "export name");
  assert(JSON.parse(exported.body).matches.length === report.matches.length, "export body");
  console.log("PASS Export");

  // Isolation
  const empty = buildCrossProjectExplorer({ organizationId: "org-other-p17" });
  assert(empty.fingerprints.length === 0, "org isolation");
  console.log("PASS Org isolation");

  console.log("\n=== ALL P17 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
