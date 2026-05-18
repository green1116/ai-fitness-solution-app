import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import type { TenderNavRect } from "@/lib/pdf/tender/nav/pdfNavTypes";
import {
  extractClickableRefTokens,
  normalizeTenderRef,
  uniqStrings, 
} from "@/lib/pdf/tender/scoreSectionFormat";
import {
  drawStatusBadge,
  normalizeTenderDisplayStatus,
} from "@/lib/pdf/tender/statusStyle";

export type TenderTableColumn<T extends Record<string, string>> = {
  key: keyof T;
  title: string;
  width: number;
  /** default | status-badge | center-text | risk-muted（风险提示列着色） */ 
  cellKind?: "default" | "status-badge" | "center-text" | "risk-muted";
};

export type RenderTenderTablePdfInput<T extends Record<string, string>> = {
  title: string;
  rows: T[];
  columns: TenderTableColumn<T>[];
  /** 返回当前行对应的编号键（如 T-01 / B-02 / S-03），用于生成 refPageMap */
  getRefKey?: (row: T) => string | undefined;
  continuationTitle?: string;
  /** 标题下方说明（仅首页；续页不重复） */
  subtitle?: string;
  footnote?: string;
  /** 为指定列内 B-xx/T-xx/A-xx/S-xx 生成独立链接矩形（页码为当前子 PDF 内 1-based） */
  inlineRefNavLinks?: {
    columnKey: keyof T;
    tokensForRow: (row: T) => string[];
  };
  /**
   * 当本行未生成任何行内链接时，为整格补一条链接（targetKey 由回调给出，需落在 navMap 中）
   */
  wholeCellLink?: {
    columnKey: keyof T;
    targetKeyForRow: (row: T) => string | undefined;
  };
};

export type RenderTenderTablePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
  refPageMap: Record<string, number>;
  navLinkRects: TenderNavRect[];
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_LEFT = 42;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 48;
const TITLE_FONT_SIZE = 15;
const HEADER_FONT_SIZE = 9;
const BODY_FONT_SIZE = 9;
const LINE_HEIGHT = 13;
const HEADER_LINE_HEIGHT = 11;
const CELL_PAD_X = 5;
const CELL_PAD_Y = 5;

const COLORS = {
  text: rgb(0.12, 0.12, 0.12),
  border: rgb(0.75, 0.78, 0.82),
  headerBg: rgb(0.93, 0.95, 0.98),
  title: rgb(0.1, 0.2, 0.42),
  statusCellBorder: rgb(0.82, 0.82, 0.82),
  subtitle: rgb(0.35, 0.35, 0.35),
  riskText: rgb(0.45, 0.2, 0.1),
};

function safeText(v: unknown): string {
  return String(v ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function readFirstExisting(candidates: string[]): Buffer {
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }
  throw new Error(`TENDER_TABLE_FONT_NOT_FOUND: ${candidates.join(" | ")}`);
}

async function loadFonts(doc: PDFDocument): Promise<{ regular: PDFFont; bold: PDFFont }> {
  doc.registerFontkit(fontkit);

  const regularBytes = readFirstExisting([
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "assets", "fonts", "NotoSansSC-Regular.ttf"),
  ]);
  const boldBytes = readFirstExisting([
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Bold.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC", "NotoSansSC-Bold.ttf"),
    path.join(process.cwd(), "assets", "fonts", "NotoSansSC-Bold.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
  ]);

  return {
    regular: await doc.embedFont(regularBytes, { subset: true }),
    bold: await doc.embedFont(boldBytes, { subset: true }),
  };
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const raw = safeText(text);
  if (!raw) return [""];
  const out: string[] = [];
  for (const para of raw.split("\n")) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    let cur = "";
    for (const ch of para) {
      const test = cur + ch;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth || !cur) cur = test;
      else {
        out.push(cur);
        cur = ch;
      }
    }
    if (cur) out.push(cur);
  }
  return out.length ? out : [""];
}

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, fill?: ReturnType<typeof rgb>) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: COLORS.border,
    borderWidth: 0.8,
    color: fill,
  });
}

function drawTitleBlock(
  page: PDFPage,
  title: string,
  fontBold: PDFFont,
  fontReg: PDFFont,
  subtitle?: string
): number {
  let y = PAGE_H - MARGIN_TOP;
  page.drawText(title, {
    x: MARGIN_LEFT,
    y,
    size: TITLE_FONT_SIZE,
    font: fontBold,
    color: COLORS.title,
  });
  y -= 22;
  const sub = safeText(subtitle || "");
  if (sub) {
    const lines = wrapText(sub, fontReg, 9, PAGE_W - MARGIN_LEFT * 2);
    for (const line of lines) {
      page.drawText(line || "", {
        x: MARGIN_LEFT,
        y,
        size: 9,
        font: fontReg,
        color: COLORS.subtitle,
      });
      y -= 12;
    }
    y -= 6;
  } else {
    y -= 4;
  }
  return y;
}

function drawHeader<T extends Record<string, string>>(
  page: PDFPage,
  yTop: number,
  columns: TenderTableColumn<T>[],
  fontBold: PDFFont
): number {
  const wrappedMap = new Map<keyof T, string[]>();

  for (const col of columns) {
    const lines = wrapText(
      safeText(col.title),
      fontBold,
      HEADER_FONT_SIZE,
      col.width - CELL_PAD_X * 2
    );
    wrappedMap.set(col.key, lines);
  }

  const maxLines = Math.max(
    ...columns.map((col) => wrappedMap.get(col.key)?.length || 1),
    1
  );

  const rowH = Math.max(
    28,
    maxLines * HEADER_LINE_HEIGHT + CELL_PAD_Y * 2 + 2
  );

  const y = yTop - rowH;
  let x = MARGIN_LEFT;

  for (const col of columns) {
    const lines = wrappedMap.get(col.key) || [safeText(col.title)];
    drawRect(page, x, y, col.width, rowH, COLORS.headerBg);

    let ly = y + rowH - CELL_PAD_Y - HEADER_FONT_SIZE;
    for (const line of lines) {
      page.drawText(line || "", {
        x: x + CELL_PAD_X,
        y: ly,
        size: HEADER_FONT_SIZE,
        font: fontBold,
        color: COLORS.text,
      });
      ly -= HEADER_LINE_HEIGHT;
    }

    x += col.width;
  }

  return y;
}

function calcRowHeight<T extends Record<string, string>>(
  row: T,
  columns: TenderTableColumn<T>[],
  font: PDFFont
) {
  const wrapped: Partial<Record<keyof T, string[]>> = {};
  for (const col of columns) {
    if (col.cellKind === "status-badge" || col.cellKind === "center-text") {
      wrapped[col.key] = safeText(row[col.key]) ? [safeText(row[col.key])] : [""];
    } else {
      wrapped[col.key] = wrapText(
        safeText(row[col.key]),
        font,
        BODY_FONT_SIZE,
        col.width - CELL_PAD_X * 2
      );
    }
  }
  const maxLines = Math.max(...columns.map((c) => wrapped[c.key]?.length || 1), 1);
  return {
    wrapped,
    height: Math.max(30, maxLines * LINE_HEIGHT + CELL_PAD_Y * 2 + 2),
  };
}

function drawRow<T extends Record<string, string>>(
  page: PDFPage,
  yTop: number,
  row: T,
  columns: TenderTableColumn<T>[],
  wrapped: Partial<Record<keyof T, string[]>>,
  rowHeight: number,
  font: PDFFont
): number {
  const y = yTop - rowHeight;
  let x = MARGIN_LEFT;
  for (const col of columns) {
    if (col.cellKind === "status-badge") {
      page.drawRectangle({
        x,
        y,
        width: col.width,
        height: rowHeight,
        borderWidth: 0.6,
        borderColor: COLORS.statusCellBorder,
      });
      drawStatusBadge({
        page,
        status: normalizeTenderDisplayStatus(row[col.key]),
        x,
        y,
        w: col.width,
        h: rowHeight,
        font,
        fontSize: BODY_FONT_SIZE,
      });
    } else {
      drawRect(page, x, y, col.width, rowHeight);
      if (col.cellKind === "center-text") {
        const line = (wrapped[col.key] || [safeText(row[col.key])])[0] || "";
        const tw = font.widthOfTextAtSize(line, BODY_FONT_SIZE);
        const tx = x + Math.max(CELL_PAD_X, (col.width - tw) / 2);
        const ly = y + rowHeight - CELL_PAD_Y - BODY_FONT_SIZE - 1;
        page.drawText(line, {
          x: tx,
          y: ly,
          size: BODY_FONT_SIZE,
          font,
          color: COLORS.text,
        });
      } else {
        const lines = wrapped[col.key] || [safeText(row[col.key])];
        const textColor =
          col.cellKind === "risk-muted" ? COLORS.riskText : COLORS.text;
        let ly = y + rowHeight - CELL_PAD_Y - BODY_FONT_SIZE - 1;
        for (const line of lines) {
          page.drawText(line || "", {
            x: x + CELL_PAD_X,
            y: ly,
            size: BODY_FONT_SIZE,
            font,
            color: textColor,
          });
          ly -= LINE_HEIGHT;
        }
      }
    }
    x += col.width;
  }
  return y;
}

function columnLeftX<T extends Record<string, string>>(
  columns: TenderTableColumn<T>[],
  key: keyof T
): number {
  let x = MARGIN_LEFT;
  for (const col of columns) {
    if (col.key === key) return x;
    x += col.width;
  }
  return MARGIN_LEFT;
}

function columnWidthOf<T extends Record<string, string>>(
  columns: TenderTableColumn<T>[],
  key: keyof T
): number {
  for (const col of columns) {
    if (col.key === key) return col.width;
  }
  return 0;
}

function pushInlineRefNavRects<T extends Record<string, string>>(params: {
  pageNo: number;
  rowTopY: number;
  columns: TenderTableColumn<T>[];
  columnKey: keyof T;
  wrappedLines: string[];
  font: PDFFont;
  tokens: string[];
  out: TenderNavRect[];
}) {
  const {
    pageNo,
    rowTopY,
    columns,
    columnKey,
    wrappedLines,
    font,
    tokens,
    out,
  } = params;
  const colX = columnLeftX(columns, columnKey);
  const colW = columnWidthOf(columns, columnKey);
  const uniqTok = uniqStrings(tokens.map(normalizeTenderRef));
  if (!uniqTok.length) return;

  for (let lineIdx = 0; lineIdx < wrappedLines.length; lineIdx++) {
    const line = wrappedLines[lineIdx] || "";
    const baselineY =
      rowTopY - CELL_PAD_Y - BODY_FONT_SIZE - 1 - lineIdx * LINE_HEIGHT;

    for (const token of uniqTok) {
      const needle = token;
      const needleLo = needle.toLowerCase();
      let from = 0;
      while (from < line.length) {
        let at = line.indexOf(needle, from);
        const used = needle.length;
        if (at < 0) {
          const loLine = line.toLowerCase();
          at = loLine.indexOf(needleLo, from);
        }
        if (at < 0) break;

        const leftText = line.slice(0, at);
        const mid = line.slice(at, at + used);
        const x = colX + CELL_PAD_X + font.widthOfTextAtSize(leftText, BODY_FONT_SIZE);
        const w = font.widthOfTextAtSize(mid, BODY_FONT_SIZE);
        const maxW = colX + colW - CELL_PAD_X - x;
        if (w > 0 && maxW > 0) {
          out.push({
            page: pageNo,
            x,
            y: baselineY - 4,
            width: Math.min(w, maxW),
            height: LINE_HEIGHT + 4,
            targetKey: normalizeTenderRef(token),
          });
        }
        from = at + used;
      }
    }
  }
}

function drawFooter(page: PDFPage, font: PDFFont, pageNo: number) {
  const txt = `${pageNo}`;
  const w = font.widthOfTextAtSize(txt, 8.5);
  page.drawText(txt, { x: PAGE_W / 2 - w / 2, y: 20, size: 8.5, font, color: rgb(0.45, 0.45, 0.45) });
}

function drawFootnote(page: PDFPage, font: PDFFont, text: string) {
  const lines = wrapText(text, font, 8.5, PAGE_W - MARGIN_LEFT * 2);
  let y = 36;
  for (const line of lines) {
    page.drawText(line || "", {
      x: MARGIN_LEFT,
      y,
      size: 8.5,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    y -= 11;
    if (y < 24) break;
  }
}

export async function renderTenderTablePdf<T extends Record<string, string>>(
  input: RenderTenderTablePdfInput<T>
): Promise<RenderTenderTablePdfResult> {
  const doc = await PDFDocument.create();
  const { regular, bold } = await loadFonts(doc);
  const rows = input.rows || [];
  const title = safeText(input.title || "表格");
  const continuationTitle = safeText(input.continuationTitle || `${title}（续）`);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let pageNo = 1;
  const refPageMap: Record<string, number> = {};
  const navLinkRects: TenderNavRect[] = [];
  let cursorY = drawTitleBlock(page, title, bold, regular, input.subtitle);
  cursorY = drawHeader(page, cursorY, input.columns, bold);

  for (const row of rows) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, safeText(v)])
    ) as T;
    const { wrapped, height } = calcRowHeight(normalized, input.columns, regular);
    if (cursorY - height < MARGIN_BOTTOM + 28) {
      drawFooter(page, regular, pageNo);
      page = doc.addPage([PAGE_W, PAGE_H]);
      pageNo += 1;
      cursorY = drawTitleBlock(page, continuationTitle, bold, regular);
      cursorY = drawHeader(page, cursorY, input.columns, bold);
    }
    const refKey = input.getRefKey?.(normalized);
    if (refKey && !refPageMap[refKey]) {
      refPageMap[refKey] = pageNo;
    }
    const rowTopY = cursorY;
    cursorY = drawRow(page, cursorY, normalized, input.columns, wrapped, height, regular);
    const rowBottomY = cursorY;
    const linkSpec = input.inlineRefNavLinks;
    if (linkSpec) {
      const cellText = safeText(normalized[linkSpec.columnKey]);
      const tokens =
        linkSpec.tokensForRow(normalized).length > 0
          ? linkSpec.tokensForRow(normalized)
          : extractClickableRefTokens(cellText);
      const navCountBefore = navLinkRects.length;
      pushInlineRefNavRects({
        pageNo,
        rowTopY,
        columns: input.columns,
        columnKey: linkSpec.columnKey,
        wrappedLines: wrapped[linkSpec.columnKey] || [""],
        font: regular,
        tokens,
        out: navLinkRects,
      });
      const whole = input.wholeCellLink;
      if (
        whole &&
        whole.columnKey === linkSpec.columnKey &&
        navLinkRects.length === navCountBefore
      ) {
        const tk = whole.targetKeyForRow(normalized);
        if (tk) {
          const colX = columnLeftX(input.columns, whole.columnKey);
          const colW = columnWidthOf(input.columns, whole.columnKey);
          const pad = 2;
          navLinkRects.push({
            page: pageNo,
            x: colX + pad,
            y: rowBottomY + pad,
            width: Math.max(8, colW - pad * 2),
            height: Math.max(8, rowTopY - rowBottomY - pad * 2),
            targetKey: normalizeTenderRef(tk),
          });
        }
      }
    }
  }

  if (input.footnote && safeText(input.footnote)) {
    drawFootnote(page, regular, safeText(input.footnote));
  }
  drawFooter(page, regular, pageNo);
  return {
    bytes: await doc.save(),
    pageCount: doc.getPageCount(),
    refPageMap,
    navLinkRects,
  };
}

