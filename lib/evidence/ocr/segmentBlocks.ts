import type { OcrBlock, OcrBlockKind } from "../types";

const HEADING_RE =
  /^(第[一二三四五六七八九十百千\d]+[章节条部分]|[一二三四五六七八九十]+[、.．]|\d+[.．、])\s*.+/;
const LIST_RE = /^(\d+[.)）]|[•\-*])\s+\S/;
const TABLE_ROW_RE = /^\|.+\|.+\|$/;

function blockId(attachmentId: string, page: number, index: number) {
  return `blk-${attachmentId}-p${page}-b${index}`;
}

function detectKind(line: string): OcrBlockKind {
  const t = line.trim();
  if (!t) return "line";
  if (TABLE_ROW_RE.test(t)) return "table_row";
  if (LIST_RE.test(t)) return "list_item";
  if (HEADING_RE.test(t)) return "heading";
  if (t.length <= 48 && /[：:]$/.test(t)) return "heading";
  if (t.length <= 24 && /^[A-Z0-9\s\-]+$/.test(t)) return "heading";
  return "line";
}

function paragraphKind(lines: string[]): OcrBlockKind {
  if (lines.length === 1) return detectKind(lines[0]);
  const kinds = lines.map((l) => detectKind(l));
  if (kinds.every((k) => k === "table_row")) return "table_row";
  if (kinds.some((k) => k === "heading")) return "paragraph";
  return "paragraph";
}

/**
 * 将页文本切分为确定性 OCR Blocks
 */
export function segmentPageIntoBlocks(
  attachmentId: string,
  page: number,
  pageText: string,
  globalOffset: number,
): { blocks: OcrBlock[]; nextOffset: number } {
  const blocks: OcrBlock[] = [];
  const normalized = pageText.replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    return { blocks, nextOffset: globalOffset };
  }

  const paragraphs = normalized.split(/\n{2,}/);
  let blockIndex = 0;
  let offset = globalOffset;
  let lineNo = 1;

  for (const para of paragraphs) {
    const lines = para.split("\n").filter((l) => l.length > 0);
    if (!lines.length) continue;

    const kind = paragraphKind(lines);
    const text = lines.join("\n");
    const charStart = offset;
    const charEnd = offset + text.length;
    const lineStart = lineNo;
    const lineEnd = lineNo + lines.length - 1;
    lineNo = lineEnd + 1;

    blocks.push({
      blockId: blockId(attachmentId, page, blockIndex++),
      attachmentId,
      page,
      kind,
      text,
      charStart,
      charEnd,
      lineStart,
      lineEnd,
      coordinates: {
        page,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        unit: "point",
      },
    });

    offset = charEnd + 2;
  }

  return { blocks, nextOffset: offset };
}

export function segmentDocumentIntoBlocks(
  attachmentId: string,
  pageTexts: string[],
  filenameFallback?: string,
): OcrBlock[] {
  if (pageTexts.length === 1 && pageTexts[0] === filenameFallback && filenameFallback) {
    return [
      {
        blockId: blockId(attachmentId, 1, 0),
        attachmentId,
        page: 1,
        kind: "filename_fallback",
        text: filenameFallback,
        charStart: 0,
        charEnd: filenameFallback.length,
        lineStart: 1,
        lineEnd: 1,
        coordinates: { page: 1, x: 72, y: 72, width: 468, height: 14, unit: "point" },
      },
    ];
  }

  const all: OcrBlock[] = [];
  let offset = 0;
  for (let i = 0; i < pageTexts.length; i++) {
    const page = i + 1;
    const { blocks, nextOffset } = segmentPageIntoBlocks(
      attachmentId,
      page,
      pageTexts[i],
      offset,
    );
    all.push(...blocks);
    offset = nextOffset;
  }
  return all;
}
