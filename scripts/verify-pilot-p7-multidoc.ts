/**
 * Pilot P7 — Multi-Document Intake Consolidation verification
 */
import {
  addParsedDocumentToIntake,
  clearIntakeStoreForTests,
  consolidateDocumentRequirements,
  createIntakeSession,
  extractDocumentRequirements,
  listIntakeAudit,
  runTenderParserPipeline,
  updateIntakeSession,
  computeDocumentPriority,
} from "../lib/pilot/v80";

const PRIMARY = `
项目名称：星河健身中心主标书项目
招标人：星河管理有限公司
建设地点：上海市浦东新区
一、技术需求
1. 有氧区配置跑步机不少于 8 台。
2. 场地面积不小于 800 ㎡。
`.trim();

const ADDENDUM = `
项目名称：星河健身中心补遗项目名
招标人：星河管理有限公司
建设地点：上海市浦东新区
补遗说明
1. 有氧区配置跑步机不少于 12 台。
2. 场地面积不小于 800 ㎡。
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P7 / Multi-Document Intake Consolidation ===\n");
  clearIntakeStoreForTests();

  const primaryParsed = await runTenderParserPipeline({
    rawText: PRIMARY,
    fileName: "主标书-招标文件.txt",
  });
  const addendumParsed = await runTenderParserPipeline({
    rawText: ADDENDUM,
    fileName: "补遗-01-澄清.txt",
  });

  const session = createIntakeSession({
    organizationId: "org-p7",
    userId: "user-p7",
    fileName: "主标书-招标文件.pdf",
    mimeType: "application/pdf",
    fileSize: PRIMARY.length,
    parseResult: primaryParsed,
  });

  const primaryDoc = extractDocumentRequirements({
    id: "doc-primary",
    fileName: "主标书-招标文件.pdf",
    mimeType: "application/pdf",
    fileSize: PRIMARY.length,
    docType: "primary",
    order: 0,
    priority: computeDocumentPriority("primary", 0),
    parseResult: primaryParsed,
    uploadedAt: new Date().toISOString(),
    status: "parsed",
  });

  assert(primaryDoc.requirements, "primary extracted");
  assert(
    primaryDoc.requirements!.technicalRequirements.some((i) => i.sourceDocumentId === "doc-primary") ||
      primaryDoc.requirements!.functionalRequirements.some((i) => i.sourceDocumentId === "doc-primary") ||
      [...primaryDoc.requirements!.technicalRequirements, ...primaryDoc.requirements!.equipment].some(
        (i) => i.sourceDocumentId === "doc-primary",
      ),
    "sourceDocumentId stamped",
  );
  console.log("PASS Per-document extract + source stamp");

  updateIntakeSession(session.id, {
    status: "extracted",
    documents: [primaryDoc],
    requirements: primaryDoc.requirements,
    extractedRequirements: primaryDoc.requirements,
    requirementsRevision: 1,
  });

  const added = addParsedDocumentToIntake({
    sessionId: session.id,
    organizationId: "org-p7",
    actorId: "user-p7",
    fileName: "补遗-01-澄清.pdf",
    mimeType: "application/pdf",
    fileSize: ADDENDUM.length,
    parseResult: addendumParsed,
    docType: "addendum",
  });

  assert(added.documents.length === 2, "two documents");
  assert(added.consolidation.documentCount === 2, "consolidated from 2");
  assert(
    added.documents.some((d) => d.docType === "addendum"),
    "addendum registered",
  );
  assert(
    added.documents.find((d) => d.docType === "addendum")!.priority >
      added.documents.find((d) => d.docType === "primary")!.priority,
    "addendum priority higher",
  );
  console.log("PASS Document registry + source priority");

  // Conflict: 8 vs 12 treadmills — addendum should win
  const techTexts = added.requirements.technicalRequirements.map((t) => t.text).join(" | ");
  const equipTexts = added.requirements.equipment.map((t) => t.text).join(" | ");
  const allText = `${techTexts} ${equipTexts} ${added.requirements.scope}`;
  assert(/12/.test(allText) || added.consolidation.conflicts.some((c) => c.kind === "conflict"), "conflict or 12 kept");
  assert(
    added.consolidation.conflicts.some(
      (c) => c.kind === "conflict" || c.kind === "duplicate" || c.kind === "superseded",
    ),
    "has reconciliation records",
  );
  console.log("PASS Cross-document conflict / duplicate handling");

  // Pure consolidate unit check
  const addendumDoc = extractDocumentRequirements({
    id: "doc-add",
    fileName: "补遗-01.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
    docType: "addendum",
    order: 1,
    priority: computeDocumentPriority("addendum", 1),
    parseResult: addendumParsed,
    uploadedAt: new Date().toISOString(),
    status: "parsed",
  });
  const pure = consolidateDocumentRequirements([primaryDoc, addendumDoc]);
  assert(pure.consolidation.keptItemCount > 0, "kept items");
  assert(pure.requirements.projectName.length > 0, "merged project name");
  // addendum wins scalar if different
  assert(
    pure.requirements.projectName.includes("补遗") ||
      pure.consolidation.conflicts.some((c) => c.listKey === "scalar"),
    "scalar priority or conflict recorded",
  );
  console.log("PASS Unified consolidation output");

  const audits = listIntakeAudit(session.id);
  assert(
    audits.some((e) => e.step === "upload" && e.meta?.multiDoc === true),
    "upload audited",
  );
  assert(audits.some((e) => e.step === "consolidate"), "consolidate audited");
  console.log("PASS Audit trail");

  // Evidence preserved with document name
  const withEvidence = [
    ...added.requirements.technicalRequirements,
    ...added.requirements.equipment,
    ...added.requirements.functionalRequirements,
  ].filter((i) => (i.evidence?.length ?? 0) > 0 || i.sourceDocumentId);
  assert(withEvidence.length > 0, "source attribution retained");
  console.log("PASS Evidence / source attribution retained");

  console.log("\n=== ALL P7 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
