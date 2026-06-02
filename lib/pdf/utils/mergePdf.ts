import type { PDFDocument } from "pdf-lib";

/** 使用 pdf-lib copyPages 将 donor 的指定页按序追加到 target（编排层工具，不生成正文）。 */
export async function copyPdfPagesInto(
  target: PDFDocument,
  donor: PDFDocument,
  pageIndices: readonly number[],
): Promise<void> {
  if (pageIndices.length === 0) return;
  const copied = await target.copyPages(donor, [...pageIndices]);
  for (const p of copied) {
    target.addPage(p);
  }
}
