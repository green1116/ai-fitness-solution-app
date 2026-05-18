// lib/pdf/render.ts
import { buildPreviewWithCTA } from "@/lib/pdf/buildPreviewWithCTA";
import { renderPlan22PdfBytes, getSectionFlags } from "@/lib/pdf/plan/renderPlan22";

type Mode = "preview" | "full" | "budget";
export type PdfVariant = "sales" | "tender";
export type RenderPdfOptions = {
  mode?: Mode;
  variant?: PdfVariant;
  internalPack?: boolean;
};

export async function renderPdf(
  planId: string,
  opts?: RenderPdfOptions
): Promise<Uint8Array> {
  console.log("🔥 USING render.ts / renderPdf");
  console.log("planId =", planId);
  console.log("options =", opts);

  const mode: Mode = opts?.mode || "full";
  const variant: PdfVariant = opts?.variant || "sales";
  const internalPack = opts?.internalPack === true;
  const flags = getSectionFlags(variant);

  console.log("PDF variant =", variant);
  console.log("flags =", flags);
  console.log("[renderPdf] ENTER", { planId, mode, variant });

  if (mode === "budget") {
    throw new Error("BUDGET_MODE_SHOULD_USE_BUDGET_ROUTE");
  }

  const fullBytes = await renderPlan22PdfBytes(planId, {
    variant,
    internalPack,
  });
  console.log("[renderPdf] FULL_READY", { bytes: fullBytes.length });

  if (mode === "preview") {
    const previewBytes = await buildPreviewWithCTA(fullBytes);
    console.log("[renderPdf] PREVIEW_READY", { bytes: previewBytes.length });
    return previewBytes;
  }

  return fullBytes;
}