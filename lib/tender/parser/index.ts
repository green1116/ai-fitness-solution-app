import type { TenderParseResult } from "@/lib/tender/types";

import {
  extractTextFromDocx,
  extractTextFromPdf,
  extractTextFromPlainText,
} from "./extractText";
import { extractMetadata } from "./extractMetadata";
import { extractTables } from "./extractTables";
import { normalizePages, normalizeText } from "./normalizeText";
import { splitSections } from "./splitSections";

export { extractTextFromPdf, extractTextFromDocx, extractTextFromPlainText } from "./extractText";
export { normalizeText, normalizePages } from "./normalizeText";
export { splitSections } from "./splitSections";
export { extractTables } from "./extractTables";
export { extractMetadata } from "./extractMetadata";

export type ParseTenderInput = {
  buffer?: Buffer;
  rawText?: string;
  fileName?: string;
  mimeType?: string;
};

function extOf(fileName?: string): string {
  const n = String(fileName || "").toLowerCase();
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i) : "";
}

/** 统一招标解析管道：PDF / DOCX / 纯文本 */
export async function parseTenderDocument(
  input: ParseTenderInput,
): Promise<TenderParseResult> {
  const ext = extOf(input.fileName);
  let pages = await extractTextFromPlainText("");

  if (input.buffer && input.buffer.length > 0) {
    if (ext === ".pdf" || input.mimeType === "application/pdf") {
      pages = await extractTextFromPdf(input.buffer);
    } else if (
      ext === ".docx" ||
      input.mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      pages = await extractTextFromDocx(input.buffer);
    } else {
      pages = await extractTextFromPlainText(input.buffer.toString("utf8"));
    }
  } else if (input.rawText) {
    pages = await extractTextFromPlainText(input.rawText);
  }

  pages = normalizePages(pages);
  const rawText = pages.map((p) => p.text).join("\n\n");
  const normalized = normalizeText(rawText);
  const sections = splitSections(normalized, pages);
  const tables = extractTables(sections, pages);
  const metadata = extractMetadata(normalized);

  return {
    rawText: normalized,
    metadata,
    sections,
    tables,
    pages,
  };
}
