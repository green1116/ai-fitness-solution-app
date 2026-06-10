import type { PROPOSAL_PDF_VERSION } from "../shared/types";

export const PROPOSAL_SECTION_RUNTIME_VERSION = "v11.2-proposal-section-runtime-1" as const;

export type ProposalSectionKind =
  | "executive-summary"
  | "technical-proposal"
  | "implementation-plan"
  | "risk-analysis"
  | "delivery-schedule"
  | "compliance-matrix";

export interface ProposalPdfSection {
  sectionId: string;
  kind: ProposalSectionKind;
  title: string;
  pageEstimate: number;
  paragraphs: string[];
}

export interface ProposalSectionRuntimePayload {
  version: typeof PROPOSAL_SECTION_RUNTIME_VERSION;
  pdfVersion: typeof PROPOSAL_PDF_VERSION;
  sections: ProposalPdfSection[];
  summary: string;
}

export const PROPOSAL_SECTION_KINDS: ProposalSectionKind[] = [
  "executive-summary",
  "technical-proposal",
  "implementation-plan",
  "risk-analysis",
  "delivery-schedule",
  "compliance-matrix",
];
