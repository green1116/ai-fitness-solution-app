import { buildDifferentiationTenderContext } from "../bridge/tender-context";
import { buildAllProposalVariants } from "../differentiation-profile/builders";
import { runDifferentiationDashboardRuntime } from "../dashboard/runtime";
import type { ProposalDifferentiationReport } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export function buildProposalDifferentiationReport(input?: {
  deploymentId?: string;
}): ProposalDifferentiationReport {
  const deploymentId = input?.deploymentId ?? "proposal-differentiation-report-default";
  const tender = buildDifferentiationTenderContext({ deploymentId });
  const dashboard = runDifferentiationDashboardRuntime({ deploymentId });
  const { allVariants } = buildAllProposalVariants({ deploymentId });

  return {
    version: PROPOSAL_DIFFERENTIATION_VERSION,
    reportId: `proposal-differentiation-report-${deploymentId}`,
    deploymentId,
    tenderId: tender.tenderId,
    brandDifferentiation: dashboard.payload.brandDifferentiation,
    budgetDifferentiation: dashboard.payload.budgetDifferentiation,
    equipmentDifferentiation: dashboard.payload.equipmentDifferentiation,
    proposalDifferentiationScore: dashboard.payload.differentiationScore,
    proposalVariants: allVariants.map((v) => ({
      bidderBrand: v.bidderBrand,
      proposalLabel: v.proposalLabel,
      differentiationScore: v.differentiationScore,
    })),
    summary: [
      "proposal-differentiation-report",
      `tender=${tender.projectName}`,
      `brandDifferentiation=${dashboard.payload.brandDifferentiation}%`,
      `budgetDifferentiation=${dashboard.payload.budgetDifferentiation}%`,
      `equipmentDifferentiation=${dashboard.payload.equipmentDifferentiation}%`,
      `proposalDifferentiationScore=${dashboard.payload.differentiationScore}%`,
      `variants=${allVariants.map((v) => `${v.proposalLabel}:${v.bidderBrand}`).join(",")}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
