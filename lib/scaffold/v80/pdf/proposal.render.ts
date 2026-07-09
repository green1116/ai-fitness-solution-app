/** @scaffold BLP-PDF-003 */
import { renderMinimalPdfPage } from "./_render.util";

export async function renderProposalPdfScaffold(input: {
  projectId: string;
  sections: string[];
}): Promise<Uint8Array> {
  return renderMinimalPdfPage({
    title: "V80 Proposal PDF",
    lines: [`Project: ${input.projectId}`, ...input.sections.map((s, i) => `${i + 1}. ${s}`)],
  });
}
