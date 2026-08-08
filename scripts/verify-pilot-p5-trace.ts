/**
 * Pilot P5 — Source Traceability & Confidence Guard verification
 */
import {
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  findEvidenceSpans,
  itemNeedsEvidenceConfirmation,
  listEvidenceGateIssues,
  listIntakeAudit,
  mapRequirementsToTenderMetadata,
  runTenderParserPipeline,
  scoreRequirementConfidence,
  setRequirementEvidenceOverride,
  setRequirementItemReview,
  updateIntakeSession,
  validateTenderRequirementsForApproval,
  CONFIDENCE_LOW_THRESHOLD,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心建设项目
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区
一、技术标准与功能需求
1. 有氧区配置跑步机不少于 8 台。
2. 场地面积不小于 1000 ㎡。
3. 设备需符合 GB/T 22517 相关标准。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P5 / Source Traceability & Confidence Guard ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p5-sample.txt",
  });
  assert(parsed.pages.length > 0, "pages present");

  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "p5-sample.pdf",
  });

  const allItems = [
    ...extracted.technicalRequirements,
    ...extracted.functionalRequirements,
    ...extracted.equipment,
    ...extracted.space,
  ].filter((i) => i.text.trim());

  assert(allItems.length > 0, "extracted items");
  const withEvidence = allItems.filter((i) => (i.evidence?.length ?? 0) > 0 || i.pageRef);
  assert(withEvidence.length > 0, "at least one item has evidence/pageRef");
  assert(
    allItems.every((i) => typeof i.confidence === "number"),
    "all items scored",
  );
  assert(
    allItems.every((i) => i.confidenceBand === "high" || i.confidenceBand === "medium" || i.confidenceBand === "low"),
    "bands set",
  );
  console.log("PASS Evidence + confidence attached on extract");

  const spans = findEvidenceSpans("跑步机不少于 8 台", parsed.pages);
  assert(spans.length > 0, "findEvidenceSpans hits sample text");
  const lowScore = scoreRequirementConfidence({ text: "待定", evidence: [] });
  assert(lowScore < CONFIDENCE_LOW_THRESHOLD, "ambiguous text scores low");
  console.log("PASS Confidence scoring / span match");

  // Gate: invent a low-confidence item without evidence
  const gated = {
    ...extracted,
    technicalRequirements: [
      {
        id: "low-1",
        text: "待定设备方案",
        priority: "must" as const,
        reviewStatus: "pending" as const,
        evidence: [],
        confidence: 0.2,
        confidenceBand: "low" as const,
      },
      ...extracted.technicalRequirements.map((t) => ({
        ...t,
        reviewStatus: "confirmed" as const,
      })),
    ],
    functionalRequirements: extracted.functionalRequirements.map((t) => ({
      ...t,
      reviewStatus: "confirmed" as const,
    })),
    equipment: extracted.equipment.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    space: extracted.space.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    quantity: extracted.quantity.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    constraints: extracted.constraints.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    compliance: extracted.compliance.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    standards: extracted.standards.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    evaluation: extracted.evaluation.map((t) => ({ ...t, reviewStatus: "confirmed" as const })),
    optionalItems: extracted.optionalItems.map((t) => ({
      ...t,
      reviewStatus: "confirmed" as const,
    })),
  };

  assert(itemNeedsEvidenceConfirmation(gated.technicalRequirements[0]!), "needs confirm");
  const blocked = validateTenderRequirementsForApproval(gated);
  assert(!blocked.valid, "low-confidence blocks approval");
  assert(
    listEvidenceGateIssues(gated).some((i) => i.itemId === "low-1"),
    "gate lists low-1",
  );
  console.log("PASS Approval gate blocks low-confidence / missing evidence");

  const session = createIntakeSession({
    organizationId: "org-p5",
    userId: "user-p5",
    fileName: "p5-sample.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });
  updateIntakeSession(session.id, {
    status: "in_review",
    requirements: gated,
    extractedRequirements: extracted,
    requirementsRevision: 1,
  });

  const overridden = setRequirementEvidenceOverride({
    sessionId: session.id,
    organizationId: "org-p5",
    listKey: "technicalRequirements",
    itemId: "low-1",
    evidenceOverride: true,
    note: "人工核对原文后接受",
    actorId: "user-p5",
  });
  assert(
    overridden.requirements.technicalRequirements.find((i) => i.id === "low-1")
      ?.evidenceOverride === true,
    "override set",
  );
  assert(
    overridden.requirements.technicalRequirements.find((i) => i.id === "low-1")
      ?.reviewStatus === "confirmed",
    "override confirms",
  );

  // Confirm remaining musts if any still pending
  let req = overridden.requirements;
  for (const key of [
    "technicalRequirements",
    "functionalRequirements",
    "equipment",
    "space",
    "quantity",
    "constraints",
    "compliance",
    "standards",
    "evaluation",
  ] as const) {
    for (const item of req[key]) {
      if (!item.text.trim()) continue;
      if ((item.priority ?? "must") !== "must") continue;
      if (item.reviewStatus === "confirmed" || item.reviewStatus === "rejected") continue;
      setRequirementItemReview({
        sessionId: session.id,
        organizationId: "org-p5",
        listKey: key,
        itemId: item.id,
        reviewStatus: "confirmed",
        actorId: "user-p5",
      });
    }
    req = updateIntakeSession(session.id, {})!.requirements!;
  }

  const after = validateTenderRequirementsForApproval(
    updateIntakeSession(session.id, {})!.requirements!,
  );
  assert(after.valid, "passes after confirm/override");
  console.log("PASS Override + confirm clears evidence gate");

  const audit = listIntakeAudit(session.id);
  assert(
    audit.some(
      (e) =>
        e.step === "item_review" &&
        e.meta?.evidenceOverride === true,
    ),
    "override audited",
  );
  console.log("PASS Evidence override audit");

  const meta = mapRequirementsToTenderMetadata(after.requirements!);
  assert(meta.intakeVersion === "v80-pilot-p5", "p5 metadata version");
  assert(
    (meta.requirements as typeof after.requirements)!.technicalRequirements.some(
      (i) => i.id === "low-1" && i.evidenceOverride,
    ),
    "evidence preserved in tender metadata",
  );
  assert(typeof meta.evidenceTrace === "object", "evidenceTrace summary");
  console.log("PASS Evidence preserved into Tender metadata handoff");

  console.log("\n=== ALL P5 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
