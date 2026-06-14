import { TENDER_DOC_VERSION } from "@/lib/pdf/tenderDocumentContext";
import type { ProposalEngineCompatibility } from "./shared/types";

export const TENDER_PACKAGE_ENGINE_LABEL = "v4-tender-pack" as const;
export const REQSIG_VERIFICATION_LABEL = "REQSIG" as const;

export function buildProposalEngineCompatibility(): ProposalEngineCompatibility {
  return {
    planPdfEngine: TENDER_DOC_VERSION,
    budgetPdfEngine: TENDER_DOC_VERSION,
    tenderPackageEngine: TENDER_PACKAGE_ENGINE_LABEL,
    reqsigVerification: REQSIG_VERIFICATION_LABEL,
  };
}

export function formatProposalReqsigReference(reqsig: string): string {
  const trimmed = reqsig.trim();
  if (!trimmed) return REQSIG_VERIFICATION_LABEL;
  return /^REQSIG:/i.test(trimmed) ? trimmed : `REQSIG: ${trimmed}`;
}

export function buildProposalCompatibilityMetadata(
  proposalId: string,
  tenderId: string,
): Record<string, string> {
  const compatibility = buildProposalEngineCompatibility();
  return {
    planPdfEngine: compatibility.planPdfEngine,
    budgetPdfEngine: compatibility.budgetPdfEngine,
    tenderPackageEngine: compatibility.tenderPackageEngine,
    reqsigVerification: compatibility.reqsigVerification,
    reqsigReference: formatProposalReqsigReference(`${proposalId}-${tenderId}`),
    sourceLayer: "v36-tender-proposal",
  };
}
