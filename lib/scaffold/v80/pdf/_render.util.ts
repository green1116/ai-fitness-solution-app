/** V80 CODE P2 — minimal pdf-lib page builder */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { recordV80PdfRender } from "../ops/observability";

export async function renderMinimalPdfPage(input: {
  title: string;
  lines: string[];
  traceId?: string;
  artifactType?: string;
}): Promise<Uint8Array> {
  const started = Date.now();
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawText(input.title, { x: 50, y: 780, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) });

  let y = 740;
  for (const line of input.lines) {
    page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 18;
  }

  const buffer = await doc.save();
  recordV80PdfRender({
    traceId: input.traceId ?? "v80-pdf",
    artifactType: input.artifactType ?? "generic",
    durationMs: Date.now() - started,
    bytes: buffer.length,
  });
  return buffer;
}
