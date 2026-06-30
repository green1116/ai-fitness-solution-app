/**
 * Client helper — Quote PDF via existing plan PDF API.
 */
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
    let message = `Download failed (${res.status})`;
    try {
      const json = (await res.json()) as { message?: string; error?: string };
      message = json.message || json.error || message;
    } catch {
      const text = await res.text();
      if (text) message = text.slice(0, 300);
    }
    throw new Error(message);
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/pdf")) {
    throw new Error("Quote PDF endpoint returned a non-PDF response");
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
