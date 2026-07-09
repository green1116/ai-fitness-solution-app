/**
 * Client helper — Budget PDF via existing budget PDF API.
 */
import {
  assertDownloadBytes,
  parseDownloadError,
  triggerBrowserDownload,
} from "@/components/documents/downloadBinary";

export async function downloadBudgetPdf(
  projectId: string,
  fileName = "budget.pdf",
  options?: { budgetId?: string; tier?: string },
): Promise<void> {
  const pid = projectId.trim();
  if (!pid) throw new Error("projectId is required");

  const res = await fetch("/api/pdf/tender/budget", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: pid,
      planId: pid,
      ...(options?.budgetId ? { budgetId: options.budgetId } : {}),
      ...(options?.tier ? { tier: options.tier } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(await parseDownloadError(res));
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/pdf")) {
    throw new Error("Budget PDF endpoint returned a non-PDF response");
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  assertDownloadBytes(bytes, "pdf");
  triggerBrowserDownload(bytes, fileName, "application/pdf");
}
