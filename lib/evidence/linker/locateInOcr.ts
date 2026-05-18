import type { OcrDocumentResult, OcrLocation } from "../types";
import type { OcrKeywordIndex } from "../ocr/keywordIndex";
import { lookupTerm } from "../ocr/keywordIndex";

function blockCoordinates(
  doc: OcrDocumentResult,
  blockId: string,
): OcrLocation["coordinates"] {
  const block = doc.blocks.find((b) => b.blockId === blockId);
  return block?.coordinates;
}

/**
 * OCR Location — 将命中词定位到块级坐标
 */
export function locateTermsInOcr(
  index: OcrKeywordIndex,
  documents: OcrDocumentResult[],
  matchedTerms: string[],
  attachmentId?: string,
): OcrLocation[] {
  const docByAtt = new Map(documents.map((d) => [d.attachmentId, d]));
  const locations: OcrLocation[] = [];
  const seen = new Set<string>();

  for (const term of matchedTerms) {
    const entries = lookupTerm(index, term);
    for (const entry of entries) {
      if (attachmentId && entry.attachmentId !== attachmentId) continue;
      const key = `${entry.blockId}:${term}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const doc = docByAtt.get(entry.attachmentId);
      const block = doc?.blocks.find((b) => b.blockId === entry.blockId);
      const excerpt = block?.text.slice(0, 120).replace(/\s+/g, " ").trim() || term;

      locations.push({
        attachmentId: entry.attachmentId,
        blockId: entry.blockId,
        page: entry.page,
        charStart: entry.charStart,
        charEnd: entry.charEnd,
        excerpt,
        matchedTerm: term,
        coordinates: doc ? blockCoordinates(doc, entry.blockId) : undefined,
      });
    }
  }

  return locations.slice(0, 16);
}
