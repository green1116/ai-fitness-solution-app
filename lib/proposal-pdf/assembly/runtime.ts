import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalPdfRuntimeResult, ProposalPdfStageResult } from "../shared/types";
import { PROPOSAL_PDF_VERSION } from "../shared/types";
import { buildProposalPdfDescriptor, collectProposalPdfAssembly } from "./builders";
import type { ProposalPdfAssemblyRuntimePayload } from "./types";
import { PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function validateProposalPdfAssemblyRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const collected = collectProposalPdfAssembly(deploymentId);
  return {
    valid:
      collected.cover.status === "success" &&
      collected.toc.status === "success" &&
      collected.sections.status === "success" &&
      collected.sections.payload.sections.length >= 6 &&
      collected.pageCount >= 8,
  };
}

export function runProposalPdfAssemblyRuntime(input?: {
  deploymentId?: string;
}): ProposalPdfRuntimeResult<ProposalPdfAssemblyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const stages: ProposalPdfStageResult[] = [];

  const collected = runStage("pdf-assembly-collect", "Collect PDF Parts", () => collectProposalPdfAssembly(deploymentId), stages);

  const proposalPdf = runStage(
    "pdf-assembly-descriptor",
    "Proposal PDF Descriptor",
    () => {
      const sectionCount = collected.sections.payload.sections.length;
      const watermarkEnabled = collected.cover.payload.documentContext.watermarkEnabled;
      return {
        descriptorId: `proposal-pdf-${deploymentId}`,
        fileName: "proposal.pdf",
        pageCount: collected.pageCount,
        sectionCount,
        parts: ["cover", "toc", "executive-summary", "technical-proposal", "implementation-plan", "risk-analysis", "delivery-schedule", "compliance-matrix"],
        reqsigLine: undefined as string | undefined,
        watermarkEnabled,
        mode: "readiness-stub" as const,
      };
    },
    stages,
  );

  const validation = runStage("pdf-assembly-validate", "PDF Assembly Validation", () => validateProposalPdfAssemblyRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal PDF assembly validation failed");

  const payload: ProposalPdfAssemblyRuntimePayload = {
    version: PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION,
    pdfVersion: PROPOSAL_PDF_VERSION,
    documentContext: collected.cover.payload.documentContext,
    cover: collected.cover.payload,
    toc: collected.toc.payload,
    sections: collected.sections.payload,
    proposalPdf,
    summary: `proposal-pdf-assembly pages=${proposalPdf.pageCount} sections=${proposalPdf.sectionCount} file=${proposalPdf.fileName}`,
  };

  return finalizeRuntime({ domain: "proposal-pdf-assembly", deploymentId, stages, payload, summary: payload.summary });
}
