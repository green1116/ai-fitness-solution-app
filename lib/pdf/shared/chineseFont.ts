import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import type { PDFDocument, PDFFont } from "pdf-lib";

import { toPdfLibBytes } from "@/lib/pdf/pdfBytes";

export async function loadChineseFont(doc: PDFDocument): Promise<PDFFont> {
  doc.registerFontkit(fontkit);
  const fontBytes = await fs.readFile(
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
  );
  return doc.embedFont(toPdfLibBytes(fontBytes), { subset: true });
}
