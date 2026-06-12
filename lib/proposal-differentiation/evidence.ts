import { runBrandStrategyRuntime } from "./brand-strategy";
import { runBudgetStrategyRuntime } from "./budget-strategy";
import { runCompetitiveAdvantageRuntime } from "./competitive-advantage";
import { runDifferentiationDashboardRuntime } from "./dashboard";
import { runProposalDifferentiationRuntime } from "./differentiation-profile";
import { runEquipmentStrategyRuntime } from "./equipment-strategy";
import type { ProposalDifferentiationEvidence } from "./shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "./shared/types";
import { runValuePropositionRuntime } from "./value-proposition";

export const PROPOSAL_DIFFERENTIATION_DOMAINS = [
  "brand-strategy",
  "value-proposition",
  "competitive-advantage",
  "equipment-strategy",
  "budget-strategy",
  "proposal-differentiation",
  "differentiation-dashboard",
] as const;

export function buildProposalDifferentiationEvidence(input?: {
  deploymentId?: string;
}): ProposalDifferentiationEvidence {
  const deploymentId = input?.deploymentId ?? "proposal-differentiation-default";

  const runtimes = [
    runBrandStrategyRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runValuePropositionRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runCompetitiveAdvantageRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runEquipmentStrategyRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runBudgetStrategyRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runProposalDifferentiationRuntime({ deploymentId }),
    runDifferentiationDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Proposal differentiation evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-proposal-differentiation-${deploymentId}`,
    version: PROPOSAL_DIFFERENTIATION_VERSION,
    domains: [...PROPOSAL_DIFFERENTIATION_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `proposal-differentiation-evidence domains=${PROPOSAL_DIFFERENTIATION_DOMAINS.length} allSuccess=true`,
  };
}
