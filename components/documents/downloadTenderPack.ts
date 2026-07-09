/**
 * Client helper — Tender pack ZIP via POST /api/pdf/tender/zip.
 */
import {
  fetchBinaryArtifact,
  triggerBrowserDownload,
} from "@/components/documents/downloadBinary";

export async function downloadTenderPack(
  projectId: string,
  fileName = "enterprise-package.zip",
): Promise<void> {
  const pid = projectId.trim();
  if (!pid) throw new Error("projectId is required");

  const { bytes, fileName: resolvedName } = await fetchBinaryArtifact(
    "/api/pdf/tender/zip",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: pid }),
    },
    "zip",
  );

  const safeName = fileName.endsWith(".zip") ? fileName : "enterprise-package.zip";
  triggerBrowserDownload(bytes, safeName || resolvedName, "application/zip");
}
