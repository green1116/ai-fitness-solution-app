import {
  buildProposalBranding,
  buildProposalDocumentContext,
  PROPOSAL_PDF_DOC_VERSION,
} from "../shared/metadata";
import type { ProposalCoverContent } from "./types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function buildProposalCoverContent(input?: {
  deploymentId?: string;
}): ProposalCoverContent {
  const deploymentId = input?.deploymentId ?? "cover-default";
  const ctx = buildProposalDocumentContext({ deploymentId });
  return {
    coverId: `cover-${deploymentId}`,
    projectName: ctx.projectName,
    customerName: ctx.customerName,
    proposalVersion: PROPOSAL_PDF_DOC_VERSION,
    generatedDate: formatDate(ctx.generatedAt),
    branding: buildProposalBranding(),
  };
}
