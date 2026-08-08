/**
 * Pilot P6 — AI Clarification Loop verification
 */
import {
  answerClarificationQuestion,
  assertClarificationsResolved,
  clearIntakeStoreForTests,
  createIntakeSession,
  detectRequirementGaps,
  extractRequirementsFromParsedTender,
  generateClarificationQuestions,
  listIntakeAudit,
  listOpenBlockingClarifications,
  mergeClarificationAnswerIntoRequirements,
  runClarificationDetection,
  runTenderParserPipeline,
  skipClarificationQuestion,
  updateIntakeSession,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：
招标人：
建设地点：
一、技术标准与功能需求
1. 有氧区配置跑步机大约若干台。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P6 / AI Clarification Loop ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p6.txt",
  });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "p6.pdf",
  });

  // Force classic gaps for deterministic check
  const sparse = {
    ...extracted,
    projectName: "",
    organization: "",
    location: "",
    scope: "",
    objectives: [] as string[],
    technicalRequirements: [
      {
        id: "amb-1",
        text: "跑步机大约若干台",
        priority: "must" as const,
        reviewStatus: "pending" as const,
        confidence: 0.4,
        confidenceBand: "low" as const,
        evidence: [],
      },
    ],
    functionalRequirements: [],
    equipment: [],
    space: [],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [],
    evaluation: [],
    optionalItems: [],
    budget: { currency: "CNY", notes: "" },
    schedule: { milestones: [] as string[] },
  };

  const gaps = detectRequirementGaps(sparse);
  assert(gaps.some((g) => g.fieldPath === "projectName"), "gap projectName");
  assert(gaps.some((g) => g.fieldPath === "organization"), "gap organization");
  assert(gaps.some((g) => g.kind === "ambiguous"), "gap ambiguous");
  const questions = generateClarificationQuestions(gaps, 1);
  assert(questions.length >= 3, "questions generated");
  console.log("PASS Gap detector + question generator");

  const merged = mergeClarificationAnswerIntoRequirements(
    sparse,
    { type: "scalar", key: "projectName" },
    "P6 澄清测试项目",
  );
  assert(merged.projectName === "P6 澄清测试项目", "merge scalar");
  console.log("PASS Answer merge");

  const session = createIntakeSession({
    organizationId: "org-p6",
    userId: "user-p6",
    fileName: "p6.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    status: "in_review",
    requirements: sparse,
    extractedRequirements: sparse,
    requirementsRevision: 1,
  });

  const detected = runClarificationDetection({
    sessionId: session.id,
    organizationId: "org-p6",
    actorId: "user-p6",
  });
  assert(detected.clarifications.round >= 1, "round bumped");
  const blocking = listOpenBlockingClarifications(detected.clarifications);
  assert(blocking.length > 0, "blocking open");

  let threw = false;
  try {
    assertClarificationsResolved(detected.session);
  } catch (err) {
    threw = err instanceof Error && err.message === "CLARIFICATION_REQUIRED";
  }
  assert(threw, "approve blocked by clarifications");
  console.log("PASS Approval integration (blocking open)");

  // Answer all blocking questions
  let current = detected;
  for (const q of listOpenBlockingClarifications(current.clarifications)) {
    let answer = "已明确补充";
    if (q.fieldPath === "projectName") answer = "P6 澄清测试项目";
    if (q.fieldPath === "organization") answer = "测试招标单位";
    if (q.fieldPath === "location") answer = "上海";
    if (q.fieldPath === "scope") answer = "企业健身房建设与设备采购";
    if (q.fieldPath.includes("amb-1") || q.kind === undefined) {
      if (q.question.includes("含糊") || q.fieldPath.includes("amb-1")) {
        answer = "有氧区配置跑步机不少于 8 台";
      }
    }
    if (q.fieldPath === "technicalRequirements") {
      answer = "有氧区配置跑步机不少于 8 台";
    }
    current = {
      ...current,
      ...answerClarificationQuestion({
        sessionId: session.id,
        organizationId: "org-p6",
        questionId: q.id,
        answer,
        actorId: "user-p6",
      }),
    };
  }

  // Skip remaining advisory
  for (const q of current.clarifications.questions.filter((x) => x.status === "open")) {
    if (q.severity === "advisory") {
      skipClarificationQuestion({
        sessionId: session.id,
        organizationId: "org-p6",
        questionId: q.id,
        actorId: "user-p6",
      });
    } else {
      answerClarificationQuestion({
        sessionId: session.id,
        organizationId: "org-p6",
        questionId: q.id,
        answer: "补充说明已确认",
        actorId: "user-p6",
      });
    }
  }

  // Re-detect may create new questions for remaining gaps — keep answering until clear
  for (let i = 0; i < 5; i++) {
    const again = runClarificationDetection({
      sessionId: session.id,
      organizationId: "org-p6",
      actorId: "user-p6",
    });
    const openBlocking = listOpenBlockingClarifications(again.clarifications);
    if (openBlocking.length === 0) break;
    for (const q of openBlocking) {
      answerClarificationQuestion({
        sessionId: session.id,
        organizationId: "org-p6",
        questionId: q.id,
        answer:
          q.fieldPath === "projectName"
            ? "P6 澄清测试项目"
            : q.fieldPath === "organization"
              ? "测试招标单位"
              : q.fieldPath === "location"
                ? "上海"
                : q.fieldPath === "scope"
                  ? "企业健身房建设"
                  : "有氧区配置跑步机不少于 8 台",
        actorId: "user-p6",
      });
    }
  }

  const finalSession = updateIntakeSession(session.id, {})!;
  assertClarificationsResolved(finalSession);
  assert(finalSession.requirements?.projectName === "P6 澄清测试项目", "merged project");
  assert((finalSession.requirementsRevision ?? 0) > 1, "revision bumped");

  const clarifyAudits = listIntakeAudit(session.id).filter((e) => e.step === "clarify");
  assert(clarifyAudits.length >= 2, "clarify audited");
  console.log("PASS Answer merge + re-validation + audit");

  console.log("\n=== ALL P6 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
