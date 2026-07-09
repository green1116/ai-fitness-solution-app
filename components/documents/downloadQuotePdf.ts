/**
 * Client helper — Quote PDF via existing plan PDF API.
 */
import {
  assertDownloadBytes,
  parseDownloadError,
  triggerBrowserDownload,
} from "@/components/documents/downloadBinary";

export async function downloadQuotePdf(
  projectId?: string,
  fileName = "quote.pdf",
  quoteId?: string,
): Promise<void> {
  let pid = (projectId ?? "").trim();
  if (!pid) {
    if (!quoteId) {
      throw new Error("projectId is required");
    }
    const lookup = await fetch(`/api/workspace/quotes/${encodeURIComponent(quoteId)}`);
    const data = (await lookup.json()) as {
      ok?: boolean;
      quote?: { projectId?: string };
    };
    if (!lookup.ok || !data.ok || !data.quote?.projectId) {
      throw new Error("Unable to resolve projectId for quote");
    }
    pid = data.quote.projectId;
  }

  const res = await fetch("/api/pdf/tender/plan", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: pid,
      planId: pid,
      docType: "plan",
    }),
  });

  if (!res.ok) {
    throw new Error(await parseDownloadError(res));
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/pdf")) {
    throw new Error("Quote PDF endpoint returned a non-PDF response");
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  assertDownloadBytes(bytes, "pdf");
  triggerBrowserDownload(bytes, fileName, "application/pdf");
}
