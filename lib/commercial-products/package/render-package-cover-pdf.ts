import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont } from "pdf-lib";
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

function readFirstExisting(candidates: string[]): Buffer {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate);
  }
  throw new Error(`PACKAGE_COVER_FONT_NOT_FOUND: ${candidates.join(" | ")}`);
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

export async function renderPackageCoverPdf(input: {
  quoteId: string;
  projectName: string;
  sku?: string;
  generatedAt: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await loadFont(doc);
  const page = doc.addPage([595.28, 841.89]);
  const layout = computeBrandLayout(page);

  drawBrandHeader(page, font, layout);

  let y = layout.contentTop - 8;
  y = drawKicker(page, font, layout, y, "Commercial Deliverable Package · V47");
  y = drawH2(page, font, layout, y, "Customer Delivery Cover");
  y = drawDivider(page, layout, y);

  const lines = [
    `Project: ${input.projectName}`,
    input.sku ? `SKU: ${input.sku}` : "",
    `Quote ID: ${input.quoteId}`,
    `Generated At: ${input.generatedAt}`,
    "",
    "Included: cover, summary, plan, budget, manifest",
  ].filter(Boolean);

  let lineY = y - GAP_MD;
  for (const line of lines) {
    page.drawText(line, {
      x: layout.left,
      y: lineY,
      size: TYPE.BODY,
      font,
      color: TYPE.C.text,
    });
    lineY -= TYPE.LH.BODY;
  }

  drawBrandFooter(page, font, layout, {
    planId: input.quoteId,
    ymd: input.generatedAt.slice(0, 10),
    sig: input.quoteId,
    pageNo: 1,
    pageTotal: 1,
  });

  return doc.save();
}
