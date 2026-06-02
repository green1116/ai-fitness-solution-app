import type { NormalizedEvidencePayload } from "@/lib/tender/evidence/adapters/types";
import type { ExtractedAttachment } from "../types";

/**
 * V3.3 附件提取结果 → Evidence payloads
 */
export function adaptAttachmentEvidence(
  extractions: ExtractedAttachment[],
): NormalizedEvidencePayload[] {
  const now = new Date().toISOString();

  return extractions.map((ext) => {
    const confidence =
      ext.extractionMethod === "filename_only"
        ? Math.min(0.45, ext.classificationConfidence)
        : Math.min(
            0.95,
            ext.classificationConfidence *
              (ext.charCount > 100 ? 1 : ext.charCount > 0 ? 0.75 : 0.5),
          );

    const coverageStatus =
      ext.linkedRequirementIds.length > 0 && confidence >= 0.72
        ? "fully_evidenced"
        : ext.linkedRequirementIds.length > 0
          ? "partially_evidenced"
          : ext.charCount > 0
            ? "risky"
            : "unsupported";

    return {
      sourceKind: "attachment",
      sourceId: ext.attachmentId,
      evidenceType: ext.evidenceType,
      title: `${ext.classificationLabel} — ${ext.fileName}`,
      summary: ext.excerpt || `附件 ${ext.fileName}`,
      extractedText: ext.rawText.slice(0, 4000),
      fileRef: ext.fileName,
      confidence,
      coverageStatus,
      linkedRequirementIds:
        ext.linkedRequirementIds.length > 0 ? ext.linkedRequirementIds : undefined,
      matchedField: `attachment:${ext.extractionMethod}`,
      trace: "attachment-evidence.ingest",
      createdAt: now,
    };
  });
}
