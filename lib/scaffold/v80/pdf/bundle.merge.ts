/** @scaffold BLP-PDF-004 */
import { PDFDocument } from "pdf-lib";

import { v80Persist } from "../runtime/store";

export async function mergePdfBundleScaffold(projectId: string): Promise<Uint8Array> {
  const parts = (await v80Persist.listArtifactsByProject(projectId)).filter(
    (a) => a.type !== "bundle",
  );

  if (parts.length === 0) {
    const { renderMinimalPdfPage } = await import("./_render.util");
    return renderMinimalPdfPage({ title: "V80 Bundle", lines: [`Project: ${projectId}`, "No parts — empty bundle"] });
  }

  const merged = await PDFDocument.create();
  for (const part of parts) {
    const src = await PDFDocument.load(part.buffer);
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const p of pages) merged.addPage(p);
  }
  return merged.save();
}
