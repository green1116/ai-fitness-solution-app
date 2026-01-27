// lib/pdf/render.ts
// 注意：这是一个临时实现，后续需要将完整的 PDF 生成逻辑移到这里
// 目前通过动态导入使用 app/api/pdf/route.ts 中的 generatePdfFromPlan

import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

function pickCompanyName(plan: any): string {
  return (
    plan?.client_profile?.company_name ||
    plan?.clientProfile?.companyName ||
    plan?.client_profile?.companyName ||
    ""
  ).toString().trim();
}

export async function addWatermark(
  pdfBytes: Uint8Array,
  opts: { text: string; light?: boolean }
) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(opts.text, {
      x: width * 0.08,
      y: height * 0.55,
      size: opts.light ? 18 : 42,
      font,
      color: rgb(0.6, 0.6, 0.6),
      rotate: degrees(25),
      opacity: opts.light ? 0.15 : 0.28,
    });
  }

  return await pdfDoc.save();
}

export async function renderPdf(plan: any, options?: { mode?: "preview" | "full" }): Promise<Uint8Array> {
  // 动态导入以避免循环依赖
  const { generatePdfFromPlan } = await import("@/app/api/pdf/route");
  
  const mode = options?.mode || "full";
  let bytes = await generatePdfFromPlan(plan);

  // preview：强水印（防转发）
  if (mode === "preview") {
    // preview 模式只保留前 2 页
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    if (pages.length > 2) {
      const pageIndicesToRemove = Array.from({ length: pages.length - 2 }, (_, i) => i + 2);
      for (let i = pageIndicesToRemove.length - 1; i >= 0; i--) {
        pdfDoc.removePage(pageIndicesToRemove[i]);
      }
      bytes = await pdfDoc.save();
    }
    
    const company = pickCompanyName(plan);
    const text = company ? `${company} · PREVIEW · 仅供预览` : "PREVIEW · 仅供预览";
    bytes = await addWatermark(bytes, { text, light: false });
  }

  // full：轻水印（可追溯）
  if (mode === "full") {
    const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    bytes = await addWatermark(bytes, {
      text: `Attaguy · ${stamp}`,
      light: true,
    });
  }

  return bytes;
}
