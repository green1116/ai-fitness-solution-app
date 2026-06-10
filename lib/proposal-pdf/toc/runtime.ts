import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalPdfRuntimeResult, ProposalPdfStageResult } from "../shared/types";
import { PROPOSAL_PDF_VERSION } from "../shared/types";
import { buildProposalSectionIndex, buildProposalTableOfContents } from "./builders";
import type { ProposalTocRuntimePayload } from "./types";
import { PROPOSAL_TOC_RUNTIME_VERSION } from "./types";

export function validateProposalTocRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "toc-default";
  const toc = buildProposalTableOfContents({ deploymentId });
  const index = buildProposalSectionIndex({ deploymentId });
  return {
    valid:
      toc.length >= 6 &&
      index.length === toc.length &&
      toc.every((entry, i) => entry.pageNumber <= (toc[i + 1]?.pageNumber ?? 999)),
  };
}

export function runProposalTocRuntime(input?: {
  deploymentId?: string;
}): ProposalPdfRuntimeResult<ProposalTocRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "toc-default";
  const stages: ProposalPdfStageResult[] = [];

  const tableOfContents = runStage("proposal-toc", "Table Of Contents", () => buildProposalTableOfContents({ deploymentId }), stages);
  const sectionIndex = runStage("proposal-section-index", "Section Index", () => buildProposalSectionIndex({ deploymentId }), stages);
  const validation = runStage("toc-validate", "TOC Validation", () => validateProposalTocRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal TOC validation failed");

  const payload: ProposalTocRuntimePayload = {
    version: PROPOSAL_TOC_RUNTIME_VERSION,
    pdfVersion: PROPOSAL_PDF_VERSION,
    tableOfContents,
    sectionIndex,
    summary: `proposal-toc entries=${tableOfContents.length} pages=${tableOfContents.map((e) => e.pageNumber).join(",")}`,
  };

  return finalizeRuntime({ domain: "proposal-toc", deploymentId, stages, payload, summary: payload.summary });
}
