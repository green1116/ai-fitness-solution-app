/**
 * Minimal tender pack download helper — reuses POST /api/pdf/tender/zip.
 * The server resolves Quote/Budget from the Tender; the browser only names the Tender.
 */
export type DownloadTenderPackInput = {
  projectId: string;
  tenderId: string;
  organizationId: string;
};

export async function downloadTenderPack(input: DownloadTenderPackInput): Promise<void> {
  const projectId = input.projectId.trim();
  const tenderId = input.tenderId.trim();
  const organizationId = input.organizationId.trim();
  if (!projectId) throw new Error("missing projectId");
  if (!tenderId) throw new Error("missing tenderId");
  if (!organizationId) throw new Error("missing organizationId");

  await postZipDownload(
    { projectId, planId: projectId, tenderId },
    { "x-organization-id": organizationId },
  );
}

/** Pilot intake only: legacy project-level ZIP (no Tender binding). Not for commercial Tender delivery. */
export async function downloadPilotProjectZip(projectId: string): Promise<void> {
  const id = projectId.trim();
  if (!id) throw new Error("missing projectId");
  await postZipDownload({ projectId: id, planId: id }, {});
}

async function postZipDownload(
  body: Record<string, string>,
  headers: Record<string, string>,
): Promise<void> {
  const res = await fetch("/api/pdf/tender/zip", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
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
  link.download = "投标交付包.zip";
  link.click();
  URL.revokeObjectURL(url);
}
