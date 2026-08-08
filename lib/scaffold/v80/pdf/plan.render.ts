/** @scaffold BLP-PDF-001 */
import { renderMinimalPdfPage } from "./_render.util";

export async function renderPlanPdfScaffold(projectId: string): Promise<Uint8Array> {
  return renderMinimalPdfPage({
    title: "V80 Plan PDF",
    lines: [`Project: ${projectId}`, "Section: Executive Summary", "Section: Equipment Layout", `Generated: ${new Date().toISOString()}`],
  });
}
