import { runProposalPdfAssemblyRuntime } from "./assembly";
import { runProposalCoverRuntime } from "./cover";
import { runProposalPdfDashboardRuntime } from "./dashboard";
import type { ProposalPdfEvidence } from "./shared/types";
import { PROPOSAL_PDF_VERSION } from "./shared/types";
import { runProposalSectionRuntime } from "./sections";
import { runProposalTocRuntime } from "./toc";

export const PROPOSAL_PDF_DOMAINS = [
  "proposal-cover",
  "proposal-section",
  "proposal-toc",
  "proposal-pdf-assembly",
  "proposal-pdf-dashboard",
] as const;

export function buildProposalPdfEvidence(input?: {
  deploymentId?: string;
}): ProposalPdfEvidence {
  const deploymentId = input?.deploymentId ?? "proposal-pdf-default";

  const runtimes = [
    runProposalCoverRuntime({ deploymentId }),
    runProposalSectionRuntime({ deploymentId }),
    runProposalTocRuntime({ deploymentId }),
    runProposalPdfAssemblyRuntime({ deploymentId }),
    runProposalPdfDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Proposal PDF evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-proposal-pdf-${deploymentId}`,
    version: PROPOSAL_PDF_VERSION,
    domains: [...PROPOSAL_PDF_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `proposal-pdf-evidence domains=${PROPOSAL_PDF_DOMAINS.length} allSuccess=true`,
  };
}
