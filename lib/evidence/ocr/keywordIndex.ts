import type { OcrBlock, OcrDocumentResult } from "../types";
import { tokenizeTerms } from "../linker/tokenize";

export type OcrKeywordIndexEntry = {
  term: string;
  attachmentId: string;
  blockId: string;
  page: number;
  charStart: number;
  charEnd: number;
  blockKind: OcrBlock["kind"];
};

export type OcrKeywordIndex = {
  version: "3.4-e3";
  attachmentIds: string[];
  entryCount: number;
  /** term → 出现位置列表 */
  byTerm: Record<string, OcrKeywordIndexEntry[]>;
};

function indexBlockTerms(
  block: OcrBlock,
  byTerm: Record<string, OcrKeywordIndexEntry[]>,
) {
  const terms = tokenizeTerms(`${block.text}`);
  for (const term of terms) {
    if (!byTerm[term]) byTerm[term] = [];
    byTerm[term].push({
      term,
      attachmentId: block.attachmentId,
      blockId: block.blockId,
      page: block.page,
      charStart: block.charStart,
      charEnd: block.charEnd,
      blockKind: block.kind,
    });
  }
}

/**
 * V3.4-E3 OCR Keyword Index — 块级倒排索引（确定性，非向量检索）
 */
export function buildOcrKeywordIndex(
  documents: OcrDocumentResult[],
): OcrKeywordIndex {
  const byTerm: Record<string, OcrKeywordIndexEntry[]> = {};
  const attachmentIds: string[] = [];
  let entryCount = 0;

  for (const doc of documents) {
    attachmentIds.push(doc.attachmentId);
    for (const block of doc.blocks) {
      indexBlockTerms(block, byTerm);
    }
  }
  entryCount = Object.values(byTerm).reduce((n, arr) => n + arr.length, 0);

  return {
    version: "3.4-e3",
    attachmentIds: [...new Set(attachmentIds)],
    entryCount,
    byTerm,
  };
}

export function lookupTerm(
  index: OcrKeywordIndex,
  term: string,
): OcrKeywordIndexEntry[] {
  const normalized = term.toLowerCase().trim();
  const direct = index.byTerm[normalized] || [];
  const partial: OcrKeywordIndexEntry[] = [];
  for (const [key, entries] of Object.entries(index.byTerm)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      partial.push(...entries);
    }
  }
  const seen = new Set<string>();
  const merged = [...direct, ...partial].filter((e) => {
    const k = `${e.blockId}:${e.term}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return merged.slice(0, 24);
}
