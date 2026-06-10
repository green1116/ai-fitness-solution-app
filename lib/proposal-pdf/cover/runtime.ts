import { buildProposalDocumentContext } from "../shared/metadata";
import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalPdfRuntimeResult, ProposalPdfStageResult } from "../shared/types";
import { PROPOSAL_PDF_VERSION } from "../shared/types";
import { buildProposalCoverContent } from "./builders";
import type { ProposalCoverRuntimePayload } from "./types";
import { PROPOSAL_COVER_RUNTIME_VERSION } from "./types";

export function validateProposalCoverRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "cover-default";
  const cover = buildProposalCoverContent({ deploymentId });
  return {
    valid:
      cover.projectName.length > 0 &&
      cover.customerName.length > 0 &&
      cover.proposalVersion.length > 0 &&
      cover.generatedDate.length > 0,
  };
}

export function runProposalCoverRuntime(input?: {
  deploymentId?: string;
}): ProposalPdfRuntimeResult<ProposalCoverRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "cover-default";
  const stages: ProposalPdfStageResult[] = [];

  const documentContext = runStage("cover-context", "Document Context", () => buildProposalDocumentContext({ deploymentId }), stages);
  const cover = runStage("cover-content", "Cover Content", () => buildProposalCoverContent({ deploymentId }), stages);
  const validation = runStage("cover-validate", "Cover Validation", () => validateProposalCoverRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal cover validation failed");

  const payload: ProposalCoverRuntimePayload = {
    version: PROPOSAL_COVER_RUNTIME_VERSION,
    pdfVersion: PROPOSAL_PDF_VERSION,
    documentContext,
    cover,
    summary: `proposal-cover project=${cover.projectName} version=${cover.proposalVersion}`,
  };

  return finalizeRuntime({ domain: "proposal-cover", deploymentId, stages, payload, summary: payload.summary });
}
