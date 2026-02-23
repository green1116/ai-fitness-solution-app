// lib/pdf/postprocess.ts
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export type PostprocessOpts = {
  demoWatermark?: boolean; // 是否加水印
  watermarkText?: string;  // 自定义水印文本
};

export async function postprocessPdf(
  inputBytes: Uint8Array,
  opts: PostprocessOpts = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(inputBytes);

  const pages = doc.getPages();
  if (pages.length === 0) return inputBytes;

  // ✅ DEMO 水印
  if (opts.demoWatermark) {
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const text = (opts.watermarkText || "DEMO").trim() || "DEMO";

    for (const p of pages) {
      const { width, height } = p.getSize();
      p.drawText(text, {
        x: width * 0.18,
        y: height * 0.55,
        size: Math.max(48, Math.min(width, height) * 0.09),
        font,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(25),
        opacity: 0.18,
      });
    }
  }

  return await doc.save();
}

// ✅ 兼容默认导出（防止被 default import 时挂掉）
export default postprocessPdf;
