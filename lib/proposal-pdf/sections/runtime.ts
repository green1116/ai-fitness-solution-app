import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalPdfRuntimeResult, ProposalPdfStageResult } from "../shared/types";
import { PROPOSAL_PDF_VERSION } from "../shared/types";
import { buildProposalPdfSections } from "./builders";
import type { ProposalSectionRuntimePayload } from "./types";
import { PROPOSAL_SECTION_KINDS, PROPOSAL_SECTION_RUNTIME_VERSION } from "./types";

export function validateProposalSectionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "section-default";
  const sections = buildProposalPdfSections({ deploymentId });
  const kinds = new Set(sections.map((s) => s.kind));
  return {
    valid:
      sections.length === PROPOSAL_SECTION_KINDS.length &&
      PROPOSAL_SECTION_KINDS.every((kind) => kinds.has(kind)) &&
      sections.every((s) => s.paragraphs.length >= 2),
  };
}

export function runProposalSectionRuntime(input?: {
  deploymentId?: string;
}): ProposalPdfRuntimeResult<ProposalSectionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "section-default";
  const stages: ProposalPdfStageResult[] = [];

  const sections = runStage("proposal-sections", "Proposal PDF Sections", () => buildProposalPdfSections({ deploymentId }), stages);
  const validation = runStage("section-validate", "Section Validation", () => validateProposalSectionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal section validation failed");

  const payload: ProposalSectionRuntimePayload = {
    version: PROPOSAL_SECTION_RUNTIME_VERSION,
    pdfVersion: PROPOSAL_PDF_VERSION,
    sections,
    summary: `proposal-sections count=${sections.length} pages=${sections.reduce((sum, s) => sum + s.pageEstimate, 0)}`,
  };

  return finalizeRuntime({ domain: "proposal-section", deploymentId, stages, payload, summary: payload.summary });
}
