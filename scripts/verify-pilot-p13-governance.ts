/**
 * Pilot P13 — Organization Knowledge Governance verification
 */
import {
  ORG_KNOWLEDGE_GOVERNANCE_VERSION,
  archiveOrgKnowledgePattern,
  buildOrgKnowledgeLibrary,
  clearIntakeStoreForTests,
  clearOrgKnowledgeStoreForTests,
  computeFreshnessBand,
  createIntakeSession,
  deprecateOrgKnowledgePattern,
  getOrgKnowledgeGovernanceSnapshot,
  lookupOrgKnowledgeRecommendations,
  overrideOrgKnowledgeSuggestion,
  promoteOrgKnowledgePattern,
  restoreOrgKnowledgePattern,
  runTenderParserPipeline,
  trustScoreFor,
  updateIntakeSession,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function baseRequirements(overrides: Record<string, unknown> = {}) {
  return {
    projectName: "治理测试",
    organization: "Org-P13",
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
  console.log("=== Pilot P13 / Organization Knowledge Governance ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: "项目名称：治理\n跑步机 8 台",
    fileName: "p13.txt",
  });
  const org = "org-p13";

  const s1 = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "a.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(s1.id, {
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

  const s2 = createIntakeSession({
    organizationId: org,
    userId: "u1",
    fileName: "b.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    parseResult: parsed,
  });
  updateIntakeSession(s2.id, {
    status: "approved",
    signedOff: true,
    requirements: baseRequirements({ projectName: "治理二期" }),
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

  // 1) Schema + versioning / lineage sync on build
  const library = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "builder" });
  const gov = getOrgKnowledgeGovernanceSnapshot(org);
  assert(gov?.version === ORG_KNOWLEDGE_GOVERNANCE_VERSION, "gov version");
  assert(gov!.libraryRevision >= 1, "revision");
  assert(gov!.libraryContentHash === library.contentHash, "hash link");
  assert(Object.keys(gov!.entries).length >= 3, "entries");
  const anyEntry = Object.values(gov!.entries)[0]!;
  assert(anyEntry.lineage.some((l) => l.action === "learned"), "lineage learned");
  assert(gov!.audit.some((a) => a.action === "rebuild_sync"), "audit sync");
  console.log("PASS Governance schema + versioning/lineage");

  // 2) Freshness + authority scoring
  const now = new Date().toISOString();
  assert(computeFreshnessBand(now, now) === "fresh", "fresh now");
  const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
  assert(computeFreshnessBand(old, now) === "stale", "stale 200d");
  const promotedTrust = trustScoreFor("promoted", 2, "active", "fresh");
  const learnedTrust = trustScoreFor("learned", 2, "active", "fresh");
  assert(promotedTrust > learnedTrust, "authority ranking");
  console.log("PASS Staleness + authority scoring");

  // 3) Promote / deprecate / override / restore / archive
  const equip = library.patterns.find((p) => p.kind === "equipment");
  assert(equip, "equip pattern");
  const afterPromote = promoteOrgKnowledgePattern({
    organizationId: org,
    patternId: equip!.id,
    actorId: "reviewer",
    sessionId: s1.id,
    note: "标准规格",
  });
  assert(afterPromote.entries[equip!.id]?.authority === "promoted", "promoted");
  assert(afterPromote.entries[equip!.id]?.lineage[0]?.action === "promote", "promote lineage");

  const afterOverride = overrideOrgKnowledgeSuggestion({
    organizationId: org,
    patternId: equip!.id,
    actorId: "reviewer",
    suggestion: "【权威】跑步机 ≥3.0HP，商业级连续运行",
    sessionId: s1.id,
  });
  assert(
    afterOverride.entries[equip!.id]?.overrideSuggestion?.includes("权威"),
    "override",
  );

  const clarify = library.patterns.find((p) => p.kind === "clarification");
  assert(clarify, "clarify pattern");
  deprecateOrgKnowledgePattern({
    organizationId: org,
    patternId: clarify!.id,
    actorId: "reviewer",
    reason: "预算问题已标准化，不再推荐旧问法",
    sessionId: s1.id,
  });
  assert(
    getOrgKnowledgeGovernanceSnapshot(org)!.entries[clarify!.id]?.status === "deprecated",
    "deprecated",
  );

  restoreOrgKnowledgePattern({
    organizationId: org,
    patternId: clarify!.id,
    actorId: "reviewer",
    sessionId: s1.id,
  });
  assert(
    getOrgKnowledgeGovernanceSnapshot(org)!.entries[clarify!.id]?.status === "active",
    "restored",
  );

  archiveOrgKnowledgePattern({
    organizationId: org,
    patternId: clarify!.id,
    actorId: "reviewer",
    sessionId: s1.id,
  });
  assert(
    getOrgKnowledgeGovernanceSnapshot(org)!.entries[clarify!.id]?.status === "archived",
    "archived",
  );
  console.log("PASS Promote / deprecate / override / restore / archive");

  // 4) Lookup trust indicators + archived excluded + override suggestion
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

  const lookup = lookupOrgKnowledgeRecommendations({
    organizationId: org,
    sessionId: draft.id,
    limit: 10,
  });
  assert(lookup.governance, "governance meta");
  assert(typeof lookup.governance!.libraryRevision === "number", "revision in lookup");
  assert(
    lookup.recommendations.every((r) => r.trust && r.trust.labels?.length),
    "trust indicators",
  );
  assert(
    !lookup.recommendations.some((r) => r.patternId === clarify!.id),
    "archived excluded",
  );
  const equipRec = lookup.recommendations.find((r) => r.patternId === equip!.id);
  if (equipRec) {
    assert(equipRec.trust?.authority === "promoted", "promoted trust");
    assert(equipRec.suggestion.includes("权威"), "override in rec");
    assert(equipRec.trust?.band === "high" || equipRec.trust!.score >= 0.7, "high trust");
  }
  console.log("PASS Review-time trust indicators");

  // 5) Rebuild preserves promotion
  const rebuilt = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "builder" });
  const gov2 = getOrgKnowledgeGovernanceSnapshot(org)!;
  assert(gov2.entries[equip!.id]?.authority === "promoted", "preserve promote");
  assert(gov2.parentContentHash === library.contentHash || gov2.libraryRevision > 1, "lineage hash");
  assert(rebuilt.contentHash.length === 64, "rebuild ok");
  console.log("PASS Rebuild preserves governance");

  // 6) Deterministic scoring
  const t1 = trustScoreFor("promoted", 3, "active", "fresh");
  const t2 = trustScoreFor("promoted", 3, "active", "fresh");
  assert(t1 === t2, "deterministic trust");
  console.log("PASS Deterministic scoring");

  console.log("\n=== ALL P13 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
