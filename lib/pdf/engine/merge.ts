// lib/pdf/engine/merge.ts
import { PDFDocument } from "pdf-lib";

/**
 * 合并多个 PDF（按顺序拼接页面）
 */
export async function mergePdfBytes(buffers: Uint8Array[]) {
  const out = await PDFDocument.create();

  for (const buf of buffers) {
    const src = await PDFDocument.load(buf);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }

  return out.save();
}