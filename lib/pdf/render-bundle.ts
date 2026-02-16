// lib/pdf/render-bundle.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, PDFFont } from "pdf-lib";

async function embedCNFont(doc: PDFDocument): Promise<PDFFont> {
  const p = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  try {
    const b = await fs.readFile(p);
    return await doc.embedFont(b, { subset: true });
  } catch (e) {
    throw new Error(`Missing Chinese font at ${p}`);
  }
}

export async function renderBundle(items: Array<{ title: string; body: string }>) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await embedCNFont(doc);

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 48;

  for (const it of items) {
    const page = doc.addPage([pageW, pageH]);
    page.drawText(it.title || "（无标题）", { x: margin, y: pageH - margin - 10, size: 18, font, color: rgb(0.08, 0.08, 0.08) });

    const fontSize = 11;
    const maxChars = 60;
    let y = pageH - margin - 40;
    for (let i = 0; i < it.body.length; i += maxChars) {
      const s = it.body.slice(i, i + maxChars);
      page.drawText(s, { x: margin, y, size: fontSize, font, color: rgb(0.18, 0.18, 0.18) });
      y -= fontSize + 6;
      if (y < margin + 20) break;
    }
  }

  return await doc.save();
}
