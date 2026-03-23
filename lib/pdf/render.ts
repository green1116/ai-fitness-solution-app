// lib/pdf/render.ts
import { buildPreviewWithCTA } from "@/lib/pdf/buildPreviewWithCTA";
import { renderPlan22PdfBytes } from "@/lib/pdf/plan/renderPlan22";

type Mode = "preview" | "full" | "budget";

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
    const previewBytes = await buildPreviewWithCTA(fullBytes);
    console.log("[renderPdf] PREVIEW_READY", { bytes: previewBytes.length });
    return previewBytes;
  }

  return fullBytes;
}