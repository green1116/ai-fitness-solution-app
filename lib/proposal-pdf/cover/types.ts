import type { PROPOSAL_PDF_VERSION } from "../shared/types";
import type { ProposalBranding, ProposalDocumentContext } from "../shared/metadata";

export const PROPOSAL_COVER_RUNTIME_VERSION = "v11.2-proposal-cover-runtime-1" as const;

export interface ProposalCoverContent {
  coverId: string;
  projectName: string;
  customerName: string;
  proposalVersion: string;
  generatedDate: string;
  branding: ProposalBranding;
}

export interface ProposalCoverRuntimePayload {
  version: typeof PROPOSAL_COVER_RUNTIME_VERSION;
  pdfVersion: typeof PROPOSAL_PDF_VERSION;
  documentContext: ProposalDocumentContext;
  cover: ProposalCoverContent;
  summary: string;
}
