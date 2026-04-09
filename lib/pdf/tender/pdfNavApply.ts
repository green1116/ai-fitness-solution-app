import { PDFArray, PDFDocument, PDFName } from "pdf-lib";
import type { TenderNavMap, TenderNavRect } from "@/lib/pdf/tender/pdfNavTypes";

function ensureAnnotsArray(page: any, pdfDoc: PDFDocument): PDFArray {
  const key = PDFName.of("Annots");
  const existing = page.node.lookup(key);
  if (existing) return existing as PDFArray;
  const annots = pdfDoc.context.obj([]) as PDFArray;
  page.node.set(key, annots);
  return annots;
}

export function applyTenderNavLinks(
  pdfDoc: PDFDocument,
  navMap: TenderNavMap,
  rects: TenderNavRect[]
) {
  const pages = pdfDoc.getPages();
  for (const rect of rects || []) {
    const srcIndex = rect.page - 1;
    const target = navMap[rect.targetKey];
    if (!target) continue;
    const dstIndex = target.page - 1;
    if (srcIndex < 0 || srcIndex >= pages.length) continue;
    if (dstIndex < 0 || dstIndex >= pages.length) continue;

    const srcPage: any = pages[srcIndex];
    const dstPage: any = pages[dstIndex];
    const annots = ensureAnnotsArray(srcPage, pdfDoc);

    const annot = pdfDoc.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
      Border: [0, 0, 0],
      A: {
        S: PDFName.of("GoTo"),
        D: [dstPage.ref, PDFName.of("XYZ"), 0, dstPage.getHeight(), 0],
      },
    });
    const annotRef = pdfDoc.context.register(annot);
    annots.push(annotRef);
  }
}

