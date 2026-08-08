/**
 * V80 Pilot P1/P7 — Upload + parse + intake tender session (single or multi-doc)
 */

import { runTenderParserPipeline } from "./parser.pipeline";
import { appendIntakeAudit } from "./audit-trail.service";
import { createIntakeSession, getIntakeSession, updateIntakeSession } from "./intake.store";
import {
  addParsedDocumentToIntake,
  consolidateDocumentRequirements,
  extractDocumentRequirements,
} from "./multidoc.service";
import {
  computeDocumentPriority,
  inferIntakeDocumentType,
  type IntakeDocumentType,
} from "./multidoc.schema";

const ALLOWED_EXT = [".pdf", ".docx"];

export async function uploadTenderIntake(input: {
  organizationId: string;
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  /** P7 — append to existing session */
  sessionId?: string;
  docType?: IntakeDocumentType;
}) {
  const lower = input.fileName.toLowerCase();
  if (!ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const parseResult = await runTenderParserPipeline({
    buffer: input.buffer,
    fileName: input.fileName,
    mimeType: input.mimeType,
  });

  if (!String(parseResult.rawText || "").trim()) {
    throw new Error("EMPTY_TENDER_TEXT");
  }

  if (input.sessionId) {
    const existing = getIntakeSession(input.sessionId);
    if (!existing) throw new Error("SESSION_NOT_FOUND");
    if (existing.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

    const added = addParsedDocumentToIntake({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.userId,
      fileName: input.fileName,
      mimeType: input.mimeType ?? "application/octet-stream",
      fileSize: input.buffer.length,
      parseResult,
      docType: input.docType,
    });

    return {
      sessionId: added.session.id,
      tenderIntakeId: added.session.tenderIntakeId,
      status: added.session.status,
      requirements: added.requirements,
      revision: added.revision,
      documents: added.documents.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        docType: d.docType,
        order: d.order,
        priority: d.priority,
        status: d.status,
      })),
      consolidation: added.consolidation,
      meta: {
        pageCount: parseResult.pages.length,
        chars: parseResult.rawText.length,
        sectionCount: parseResult.sections.length,
        multiDoc: true,
        documentCount: added.documents.length,
      },
    };
  }

  const session = createIntakeSession({
    organizationId: input.organizationId,
    userId: input.userId,
    fileName: input.fileName,
    mimeType: input.mimeType ?? "application/octet-stream",
    fileSize: input.buffer.length,
    parseResult,
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.userId,
    step: "upload",
    statusBefore: undefined,
    statusAfter: "parsed",
    message: `上传文件 ${input.fileName}`,
    meta: { fileName: input.fileName, fileSize: input.buffer.length },
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.userId,
    step: "parse",
    statusBefore: "parsed",
    statusAfter: "parsed",
    message: "解析招标文件",
    meta: {
      pageCount: parseResult.pages.length,
      chars: parseResult.rawText.length,
      sectionCount: parseResult.sections.length,
    },
  });

  const inferred = input.docType ?? inferIntakeDocumentType(input.fileName);
  const effectiveType: IntakeDocumentType =
    inferred === "other" ? "primary" : inferred;

  const primaryDoc = extractDocumentRequirements({
    id: `doc_primary_${session.id.slice(0, 8)}`,
    fileName: input.fileName,
    mimeType: input.mimeType ?? "application/octet-stream",
    fileSize: input.buffer.length,
    docType: effectiveType,
    order: 0,
    priority: computeDocumentPriority(effectiveType, 0),
    parseResult,
    uploadedAt: new Date().toISOString(),
    status: "parsed",
  });

  const { requirements, consolidation } = consolidateDocumentRequirements([primaryDoc]);

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.userId,
    step: "extract",
    statusBefore: "parsed",
    statusAfter: "extracted",
    message: "抽取结构化需求（v1）",
    requirementsSnapshot: requirements,
    meta: {
      projectName: requirements.projectName,
      revision: 1,
      documentId: primaryDoc.id,
      docType: effectiveType,
    },
  });

  const updated = updateIntakeSession(session.id, {
    status: "extracted",
    requirements,
    extractedRequirements: requirements,
    requirementsRevision: 1,
    documents: [primaryDoc],
    consolidation,
  });

  return {
    sessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    status: updated?.status ?? session.status,
    requirements,
    revision: 1,
    documents: [
      {
        id: primaryDoc.id,
        fileName: primaryDoc.fileName,
        docType: primaryDoc.docType,
        order: primaryDoc.order,
        priority: primaryDoc.priority,
        status: primaryDoc.status,
      },
    ],
    consolidation,
    meta: {
      pageCount: parseResult.pages.length,
      chars: parseResult.rawText.length,
      sectionCount: parseResult.sections.length,
      multiDoc: false,
      documentCount: 1,
    },
  };
}
