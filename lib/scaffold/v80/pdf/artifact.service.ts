/** V80 CODE P2 — PDF artifact persistence */
import { v80Persist, type V80PdfArtifact } from "../runtime/store";

export async function savePdfArtifact(input: {
  projectId: string;
  type: V80PdfArtifact["type"];
  buffer: Uint8Array;
}) {
  return v80Persist.saveArtifact(input);
}

export async function getPdfArtifact(artifactId: string) {
  return v80Persist.getArtifact(artifactId);
}
