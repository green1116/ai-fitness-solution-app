/**
 * Minimal tender pack download helper for Pilot Intake artifact center.
 */
export async function downloadTenderPack(projectId: string): Promise<void> {
  const url = `/api/pdf/tender/zip?projectId=${encodeURIComponent(projectId)}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
