/**
 * Minimal tender pack download helper — reuses POST /api/pdf/tender/zip.
 */
export async function downloadTenderPack(projectId: string): Promise<void> {
  const id = projectId.trim();
  if (!id) throw new Error("missing projectId");

  const res = await fetch("/api/pdf/tender/zip", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: id, planId: id }),
  });
  if (!res.ok) {
    throw new Error(`Tender pack download failed (${res.status})`);
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    throw new Error("Tender pack download failed");
  }

  const blob = await res.blob();
  if (!blob.size) throw new Error("Tender pack download failed");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "enterprise-package.zip";
  link.click();
  URL.revokeObjectURL(url);
}
