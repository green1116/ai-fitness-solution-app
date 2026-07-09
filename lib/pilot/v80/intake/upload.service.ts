/**
 * V80 Pilot P1 — Upload + parse + intake tender session
 */

import { runTenderParserPipeline } from "./parser.pipeline";
import { appendIntakeAudit } from "./audit-trail.service";
import { createIntakeSession, updateIntakeSession } from "./intake.store";
import { extractRequirementsFromParsedTender } from "./extract.service";

const ALLOWED_EXT = [".pdf", ".docx"];

export async function uploadTenderIntake(input: {
  organizationId: string;
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
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

  const requirements = extractRequirementsFromParsedTender({
    parseResult,
    sourceName: input.fileName,
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.userId,
    step: "extract",
    statusBefore: "parsed",
    statusAfter: "extracted",
    message: "抽取结构化需求",
    requirementsSnapshot: requirements,
    meta: { projectName: requirements.projectName },
  });

  const updated = updateIntakeSession(session.id, {
    status: "extracted",
    requirements,
    extractedRequirements: requirements,
  });

  return {
    sessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    status: updated?.status ?? session.status,
    requirements,
    meta: {
      pageCount: parseResult.pages.length,
      chars: parseResult.rawText.length,
      sectionCount: parseResult.sections.length,
    },
  };
}
