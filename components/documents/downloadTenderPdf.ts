/**
 * Client helper — Tender merged PDF via POST /api/pdf/tender/pack.
 */
import {
  fetchBinaryArtifact,
  triggerBrowserDownload,
} from "@/components/documents/downloadBinary";

export async function downloadTenderPdf(
  projectId: string,
  fileName = "tender.pdf",
): Promise<void> {
  const pid = projectId.trim();
  if (!pid) throw new Error("projectId is required");

  const { bytes, fileName: resolvedName } = await fetchBinaryArtifact(
    "/api/pdf/tender/pack",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: pid }),
    },
    "pdf",
  );

  triggerBrowserDownload(bytes, fileName || resolvedName, "application/pdf");
}
