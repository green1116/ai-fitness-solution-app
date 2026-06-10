import {
  PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION,
  runProposalPdfAssemblyRuntime,
  validateProposalPdfAssemblyRuntime,
  collectProposalPdfAssembly,
  renderProposalPdf,
  computeProposalReqsig,
  assertRuntimeSuccess,
} from "../lib/proposal-pdf";

const ID = "v112-proposal-assembly-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

async function main() {
  assert(validateProposalPdfAssemblyRuntime({ deploymentId: ID }).valid, "validation");
  const r = runProposalPdfAssemblyRuntime({ deploymentId: ID });
  assertRuntimeSuccess(r);
  assert(r.payload.version === PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION, "assembly version");
  assert(r.payload.proposalPdf.sectionCount === 6, "sections");
  assert(r.payload.proposalPdf.fileName === "proposal.pdf", "filename");

  const collected = collectProposalPdfAssembly(ID);
  const ctx = { ...collected.cover.payload.documentContext };
  ctx.reqsig = await computeProposalReqsig(ctx);
  const pdf = await renderProposalPdf({
    documentContext: ctx,
    cover: collected.cover.payload.cover,
    toc: collected.toc.payload.tableOfContents,
    sections: collected.sections.payload.sections,
  });
  assert(pdf.length > 1000, "pdf size");
  assert(pdf.subarray(0, 4).toString() === "%PDF", "pdf magic");
  console.log(`PASS — ${r.summary} pdfBytes=${pdf.length}`);
}

main();
