// lib/pdf/render.ts
import { PDFDocument } from "pdf-lib";
import { renderPlan22PdfBytes } from "@/lib/pdf/plan/renderPlan22";

type Mode = "preview" | "full" | "budget";

async function buildPreviewFromFull(
  fullBytes: Uint8Array,
  keepPages = 5
): Promise<Uint8Array> {
  const src = await PDFDocument.load(fullBytes);
  const out = await PDFDocument.create();

  const total = src.getPageCount();
  const count = Math.min(keepPages, total);
  const indexes = Array.from({ length: count }, (_, i) => i);

  const pages = await out.copyPages(src, indexes);
  pages.forEach((p) => out.addPage(p));

  return await out.save();
}

export async function renderPdf(
  planId: string,
  opts?: { mode?: Mode }
): Promise<Uint8Array> {
  const mode: Mode = opts?.mode || "full";

  console.log("[renderPdf] ENTER", { planId, mode });

  if (mode === "budget") {
    throw new Error("BUDGET_MODE_SHOULD_USE_BUDGET_ROUTE");
  }

  const fullBytes = await renderPlan22PdfBytes(planId);
  console.log("[renderPdf] FULL_READY", { bytes: fullBytes.length });

  if (mode === "preview") {
    const previewBytes = await buildPreviewFromFull(fullBytes, 5);
    console.log("[renderPdf] PREVIEW_READY", { bytes: previewBytes.length });
    return previewBytes;
  }

  return fullBytes;
}