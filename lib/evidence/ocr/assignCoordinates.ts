import type { OcrBlock, OcrCoordinate, OcrPageLayout } from "../types";

/** 默认 PDF 点阵版面（Letter） */
export const DEFAULT_PAGE_WIDTH_PT = 612;
export const DEFAULT_PAGE_HEIGHT_PT = 792;
const MARGIN_X = 72;
const LINE_HEIGHT_PT = 14;
const BLOCK_GAP_PT = 8;

function estimateBlockHeight(block: OcrBlock): number {
  const lines = Math.max(1, block.lineEnd - block.lineStart + 1);
  return lines * LINE_HEIGHT_PT + BLOCK_GAP_PT;
}

/**
 * 为每个 Block 分配确定性坐标（自上而下堆叠，可审计回放）
 */
export function assignBlockCoordinates(
  blocks: OcrBlock[],
  pageWidth = DEFAULT_PAGE_WIDTH_PT,
  pageHeight = DEFAULT_PAGE_HEIGHT_PT,
): OcrBlock[] {
  const byPage = new Map<number, OcrBlock[]>();
  for (const b of blocks) {
    const list = byPage.get(b.page) || [];
    list.push(b);
    byPage.set(b.page, list);
  }

  const result: OcrBlock[] = [];

  for (const [page, pageBlocks] of byPage) {
    let y = MARGIN_X;
    const contentWidth = pageWidth - MARGIN_X * 2;

    for (const block of pageBlocks) {
      const height = Math.min(
        estimateBlockHeight(block),
        pageHeight - MARGIN_X * 2,
      );
      const coordinates: OcrCoordinate = {
        page,
        x: MARGIN_X,
        y,
        width: contentWidth,
        height,
        unit: "point",
      };
      result.push({ ...block, coordinates });
      y += height;
      if (y > pageHeight - MARGIN_X) {
        y = MARGIN_X;
      }
    }
  }

  return result.sort((a, b) => a.charStart - b.charStart);
}

export function buildPageLayouts(
  attachmentId: string,
  blocks: OcrBlock[],
  pageWidth = DEFAULT_PAGE_WIDTH_PT,
  pageHeight = DEFAULT_PAGE_HEIGHT_PT,
): OcrPageLayout[] {
  const byPage = new Map<number, OcrBlock[]>();
  for (const b of blocks) {
    const list = byPage.get(b.page) || [];
    list.push(b);
    byPage.set(b.page, list);
  }

  const pages: OcrPageLayout[] = [];
  const sortedPages = [...byPage.keys()].sort((a, b) => a - b);

  for (const page of sortedPages) {
    const pageBlocks = byPage.get(page) || [];
    const text = pageBlocks.map((b) => b.text).join("\n\n");
    const lineCount = pageBlocks.reduce(
      (n, b) => n + Math.max(1, b.lineEnd - b.lineStart + 1),
      0,
    );

    pages.push({
      page,
      attachmentId,
      width: pageWidth,
      height: pageHeight,
      unit: "point",
      charCount: text.length,
      lineCount,
      blockCount: pageBlocks.length,
      blocks: pageBlocks,
      excerpt: text.slice(0, 200).replace(/\s+/g, " ").trim(),
    });
  }

  return pages;
}

/** 将 point 坐标归一化到 0–1（便于跨引擎比较） */
export function normalizeBlockCoordinates(
  blocks: OcrBlock[],
  pageWidth = DEFAULT_PAGE_WIDTH_PT,
  pageHeight = DEFAULT_PAGE_HEIGHT_PT,
): OcrBlock[] {
  return blocks.map((b) => {
    const c = b.coordinates;
    if (c.unit === "normalized") return b;
    return {
      ...b,
      coordinates: {
        page: c.page,
        x: Math.round((c.x / pageWidth) * 10000) / 10000,
        y: Math.round((c.y / pageHeight) * 10000) / 10000,
        width: Math.round((c.width / pageWidth) * 10000) / 10000,
        height: Math.round((c.height / pageHeight) * 10000) / 10000,
        unit: "normalized",
      },
    };
  });
}
