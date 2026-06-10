import type { ProposalCoverRuntimePayload } from "../cover/types";
import type { ProposalDocumentContext } from "../shared/metadata";
import type { PROPOSAL_PDF_VERSION } from "../shared/types";
import type { ProposalSectionRuntimePayload } from "../sections/types";
import type { ProposalTocRuntimePayload } from "../toc/types";

export const PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION = "v11.2-proposal-pdf-assembly-runtime-1" as const;

export interface ProposalPdfDescriptor {
  descriptorId: string;
  fileName: string;
  pageCount: number;
  sectionCount: number;
  parts: string[];
  reqsigLine?: string;
  watermarkEnabled: boolean;
  mode: "readiness-stub";
}

export interface ProposalPdfAssemblyRuntimePayload {
  version: typeof PROPOSAL_PDF_ASSEMBLY_RUNTIME_VERSION;
  pdfVersion: typeof PROPOSAL_PDF_VERSION;
  documentContext: ProposalDocumentContext;
  cover: ProposalCoverRuntimePayload;
  toc: ProposalTocRuntimePayload;
  sections: ProposalSectionRuntimePayload;
  proposalPdf: ProposalPdfDescriptor;
  summary: string;
}
