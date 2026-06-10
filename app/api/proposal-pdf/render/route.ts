import { NextResponse } from "next/server";
import { collectProposalPdfAssembly, renderProposalPdf } from "@/lib/proposal-pdf/assembly";
import { computeProposalReqsig, formatProposalReqsigLine } from "@/lib/proposal-pdf/shared/metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V11.2 — render Proposal PDF bytes (decoupled from Plan/Budget PDF). */
export async function GET() {
  const deploymentId = "render-api";
  const collected = collectProposalPdfAssembly(deploymentId);
  const ctx = collected.cover.payload.documentContext;
  ctx.reqsig = await computeProposalReqsig(ctx);

  const buffer = await renderProposalPdf({
    documentContext: ctx,
    cover: collected.cover.payload.cover,
    toc: collected.toc.payload.tableOfContents,
    sections: collected.sections.payload.sections,
  });

  const reqsigLine = formatProposalReqsigLine(ctx.reqsig);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="proposal.pdf"',
      "X-Proposal-Pdf-Version": "v11.2-proposal-pdf-1",
      ...(reqsigLine ? { "X-Proposal-Reqsig": reqsigLine } : {}),
    },
  });
}
