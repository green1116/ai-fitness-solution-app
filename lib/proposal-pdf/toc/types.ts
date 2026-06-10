import type { PROPOSAL_PDF_VERSION } from "../shared/types";

export const PROPOSAL_TOC_RUNTIME_VERSION = "v11.2-proposal-toc-runtime-1" as const;

export interface TocEntry {
  entryId: string;
  index: number;
  title: string;
  pageNumber: number;
  level: number;
}

export interface ProposalTocRuntimePayload {
  version: typeof PROPOSAL_TOC_RUNTIME_VERSION;
  pdfVersion: typeof PROPOSAL_PDF_VERSION;
  tableOfContents: TocEntry[];
  sectionIndex: TocEntry[];
  summary: string;
}
