import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";
import {
  computeBrandLayout,
  drawBrandFooter,
  drawBrandHeader,
  drawDivider,
  drawH2,
  drawKicker,
  GAP_MD,
  TYPE,
} from "@/lib/pdf/brand";
import type { SummaryPdfContext } from "./pdf-context";

function readFirstExisting(candidates: string[]): Buffer {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate);
  }
  throw new Error(`SUMMARY_PDF_FONT_NOT_FOUND: ${candidates.join(" | ")}`);
}

async function loadFont(doc: PDFDocument): Promise<PDFFont> {
  doc.registerFontkit(fontkit);
  const regularBytes = readFirstExisting([
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "assets", "fonts", "NotoSansSC-Regular.ttf"),
  ]);
  return doc.embedFont(regularBytes, { subset: true });
}

function formatCny(value: number): string {
  return `CNY ${value.toLocaleString("zh-CN")}`;
}

function drawCard(
  page: ReturnType<PDFDocument["addPage"]>,
  font: PDFFont,
  layout: ReturnType<typeof computeBrandLayout>,
  y: number,
  title: string,
  body: string,
): number {
  const cardWidth = layout.width - layout.left - layout.right;
  const lines = wrapText(body, font, TYPE.BODY, cardWidth - 24);
  const cardHeight = 28 + lines.length * TYPE.LH.BODY + 16;

  page.drawRectangle({
    x: layout.left,
    y: y - cardHeight + 8,
    width: cardWidth,
    height: cardHeight,
    color: TYPE.C.card,
    borderColor: TYPE.C.border,
    borderWidth: 1,
  });

  page.drawText(title, {
    x: layout.left + 12,
    y: y - 18,
    size: TYPE.H3,
    font,
    color: TYPE.C.text,
  });

  let lineY = y - 36;
  for (const line of lines) {
    page.drawText(line, {
      x: layout.left + 12,
      y: lineY,
      size: TYPE.BODY,
      font,
      color: TYPE.C.mute,
    });
    lineY -= TYPE.LH.BODY;
  }

  return y - cardHeight - GAP_MD;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const char of paragraph) {
      const next = current + char;
      if (font.widthOfTextAtSize(next, fontSize) > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

export async function renderSummaryPdf(context: SummaryPdfContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await loadFont(doc);
  const page = doc.addPage([595.28, 841.89]);
  const layout = computeBrandLayout(page);

  drawBrandHeader(page, font, layout);

  let y = layout.contentTop - 8;
  y = drawKicker(page, font, layout, y, "Commercial Summary · V47");
  y = drawH2(page, font, layout, y, "Sales Summary PDF");
  y -= 4;
  y = drawDivider(page, layout, y);

  const metaBody = [
    `Project Name: ${context.projectName}`,
    `SKU: ${context.sku}`,
    `Product Name: ${context.productName}`,
    `Suggested Price: ${formatCny(context.suggestedPriceCny)}`,
    `Price Band: ${formatCny(context.priceBand.min)} - ${formatCny(context.priceBand.max)}`,
    `SLA: ${context.sla}`,
    `Eligibility: ${context.eligible ? "Eligible" : "Not Eligible"}`,
    `Quote ID: ${context.quoteId}`,
    `Created At: ${context.createdAt}`,
  ].join("\n");

  y = drawCard(page, font, layout, y, "Quote Overview", metaBody);

  if (!context.eligible && context.eligibilityReasons.length > 0) {
    y = drawCard(
      page,
      font,
      layout,
      y,
      "Eligibility Notes",
      context.eligibilityReasons.map((reason) => `• ${reason}`).join("\n"),
    );
  }

  for (const section of context.sections) {
    if (y < layout.pageBottom + 120) break;
    y = drawCard(page, font, layout, y, section.title, section.body);
  }

  const ymd = context.createdAt.slice(0, 10);
  drawBrandFooter(page, font, layout, {
    planId: context.quoteId,
    ymd,
    sig: context.quoteId,
    pageNo: 1,
    pageTotal: 1,
  });

  return doc.save();
}
