/**
 * Client helper — download budget PDF for a project (reuses /api/pdf).
 * Minimal production surface for PilotFlowSuccessPanel.
 */

export type DownloadBudgetPdfOptions = {
  budgetId?: string;
  tier?: "low" | "mid" | "high";
  downloadToken?: string;
};

export async function downloadBudgetPdf(
  projectId: string,
  fileName = "budget.pdf",
  options: DownloadBudgetPdfOptions = {},
): Promise<void> {
  const sp = new URLSearchParams();
  sp.set("planId", projectId);
  sp.set("mode", "budget");
  sp.set("download", "1");
  sp.set("budgetTier", (options.tier ?? "mid").toLowerCase());
  if (options.budgetId) sp.set("budgetId", options.budgetId);

  const token =
    options.downloadToken?.trim() ||
    (process.env.NODE_ENV !== "production" ? "DEV_MODE_TOKEN" : "");
  if (token) sp.set("downloadToken", token);

  const res = await fetch(`/api/pdf?${sp.toString()}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Budget PDF download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
