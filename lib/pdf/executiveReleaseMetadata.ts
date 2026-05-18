/**
 * V3.4-E11 — 将 Executive Release Surface 写入 PDF 元数据（keywords only，不改版式）
 */
import type { PDFDocument } from "pdf-lib";

import type { ExecutiveReleaseSurface } from "@/lib/evidence/types";
import { toPdfMetadataKeywords } from "@/lib/evidence/release";

import type { TenderDocumentContext, TenderDocumentPart } from "./tenderDocumentContext";
import { applyTenderDocumentMetadata } from "./tenderDocumentContext";

/**
 * 在 V4 Tender 元数据上追加 Executive Release keywords
 */
export function applyExecutiveReleaseSurfaceMetadata(
  doc: PDFDocument,
  ctx: TenderDocumentContext,
  reqsig: string,
  surface: ExecutiveReleaseSurface,
  part: TenderDocumentPart = "pack",
): void {
  applyTenderDocumentMetadata(doc, ctx, reqsig, part);

  const extra = toPdfMetadataKeywords(surface);
  try {
    const existingRaw = doc.getKeywords();
    const existing = Array.isArray(existingRaw)
      ? existingRaw
      : existingRaw
        ? [existingRaw]
        : [];
    doc.setKeywords([...existing, ...extra].filter(Boolean));
    const subject = doc.getSubject();
    if (subject) {
      doc.setSubject(`${subject} · Gate:${surface.gateStatus} · ${surface.decision}`);
    }
  } catch (e) {
    console.warn("[EXEC_RELEASE_META] apply failed", e);
  }
}
