import { runProposalCoverRuntime } from "../cover/runtime";
import {
  computeProposalReqsig,
  formatProposalReqsigLine,
} from "../shared/metadata";
import { runProposalSectionRuntime } from "../sections/runtime";
import { runProposalTocRuntime } from "../toc/runtime";
import type { ProposalPdfDescriptor } from "./types";

export async function buildProposalPdfDescriptor(input: {
  deploymentId: string;
  pageCount: number;
  sectionCount: number;
  watermarkEnabled: boolean;
}): Promise<ProposalPdfDescriptor> {
  const coverRuntime = runProposalCoverRuntime({ deploymentId: input.deploymentId });
  const ctx = coverRuntime.payload.documentContext;
  const reqsig = await computeProposalReqsig(ctx);

  return {
    descriptorId: `proposal-pdf-${input.deploymentId}`,
    fileName: "proposal.pdf",
    pageCount: input.pageCount,
    sectionCount: input.sectionCount,
    parts: [
      "cover",
      "toc",
      "executive-summary",
      "technical-proposal",
      "implementation-plan",
      "risk-analysis",
      "delivery-schedule",
      "compliance-matrix",
    ],
    reqsigLine: formatProposalReqsigLine(reqsig),
    watermarkEnabled: input.watermarkEnabled,
    mode: "readiness-stub",
  };
}

export function collectProposalPdfAssembly(deploymentId: string) {
  const cover = runProposalCoverRuntime({ deploymentId });
  const toc = runProposalTocRuntime({ deploymentId });
  const sections = runProposalSectionRuntime({ deploymentId });
  const pageCount = 2 + sections.payload.sections.reduce((sum, s) => sum + 1, 0);
  return { cover, toc, sections, pageCount };
}
