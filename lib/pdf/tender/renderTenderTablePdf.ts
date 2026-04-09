import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { drawStatusBadge } from "@/lib/pdf/tender/statusStyle";

export type TenderTableColumn<T extends Record<string, string>> = {
  key: keyof T;
  title: string;
  width: number;
  /** default | status-badge（胶囊）| center-text（序号等单行居中） */
  cellKind?: "default" | "status-badge" | "center-text";
};

export type RenderTenderTablePdfInput<T extends Record<string, string>> = {
  title: string;
  rows: T[];
  columns: TenderTableColumn<T>[];
  continuationTitle?: string;
  footnote?: string;
};

export type RenderTenderTablePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_LEFT = 42;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 48;
const TITLE_FONT_SIZE = 15;
const HEADER_FONT_SIZE = 9.5;
const BODY_FONT_SIZE = 9;
const LINE_HEIGHT = 13;
const CELL_PAD_X = 4;
const CELL_PAD_Y = 4;

const COLORS = {
  text: rgb(0.12, 0.12, 0.12),
  border: rgb(0.75, 0.78, 0.82),
  headerBg: rgb(0.93, 0.95, 0.98),
  title: rgb(0.1, 0.2, 0.42),
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

function drawTitle(page: PDFPage, title: string, fontBold: PDFFont): number {
  const y = PAGE_H - MARGIN_TOP;
  page.drawText(title, { x: MARGIN_LEFT, y, size: TITLE_FONT_SIZE, font: fontBold, color: COLORS.title });
  return y - 24;
}

function drawHeader<T extends Record<string, string>>(
  page: PDFPage,
  yTop: number,
  columns: TenderTableColumn<T>[],
  fontBold: PDFFont
): number {
  const rowH = 24;
  const y = yTop - rowH;
  let x = MARGIN_LEFT;
  for (const col of columns) {
    drawRect(page, x, y, col.width, rowH, COLORS.headerBg);
    page.drawText(col.title, {
      x: x + CELL_PAD_X,
      y: y + 7,
      size: HEADER_FONT_SIZE,
      font: fontBold,
      color: COLORS.text,
    });
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
  return { wrapped, height: Math.max(28, maxLines * LINE_HEIGHT + CELL_PAD_Y * 2) };
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
    drawRect(page, x, y, col.width, rowHeight);
    if (col.cellKind === "status-badge") {
      drawStatusBadge({
        page,
        statusText: safeText(row[col.key]),
        cellX: x,
        cellY: y,
        cellW: col.width,
        cellH: rowHeight,
        font,
        fontSize: BODY_FONT_SIZE,
      });
    } else if (col.cellKind === "center-text") {
      const line = (wrapped[col.key] || [safeText(row[col.key])])[0] || "";
      const tw = font.widthOfTextAtSize(line, BODY_FONT_SIZE);
      const tx = x + Math.max(CELL_PAD_X, (col.width - tw) / 2);
      const ly = y + rowHeight - CELL_PAD_Y - BODY_FONT_SIZE;
      page.drawText(line, {
        x: tx,
        y: ly,
        size: BODY_FONT_SIZE,
        font,
        color: COLORS.text,
      });
    } else {
      const lines = wrapped[col.key] || [safeText(row[col.key])];
      let ly = y + rowHeight - CELL_PAD_Y - BODY_FONT_SIZE;
      for (const line of lines) {
        page.drawText(line || "", {
          x: x + CELL_PAD_X,
          y: ly,
          size: BODY_FONT_SIZE,
          font,
          color: COLORS.text,
        });
        ly -= LINE_HEIGHT;
      }
    }
    x += col.width;
  }
  return y;
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
  let cursorY = drawTitle(page, title, bold);
  cursorY = drawHeader(page, cursorY, input.columns, bold);

  for (const row of rows) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, safeText(v)])
    ) as T;
    const { wrapped, height } = calcRowHeight(normalized, input.columns, regular);
    if (cursorY - height < MARGIN_BOTTOM + 20) {
      drawFooter(page, regular, pageNo);
      page = doc.addPage([PAGE_W, PAGE_H]);
      pageNo += 1;
      cursorY = drawTitle(page, continuationTitle, bold);
      cursorY = drawHeader(page, cursorY, input.columns, bold);
    }
    cursorY = drawRow(page, cursorY, normalized, input.columns, wrapped, height, regular);
  }

  if (input.footnote && safeText(input.footnote)) {
    drawFootnote(page, regular, safeText(input.footnote));
  }
  drawFooter(page, regular, pageNo);
  return { bytes: await doc.save(), pageCount: doc.getPageCount() };
}

