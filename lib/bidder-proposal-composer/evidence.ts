import { runBidderProposalDashboardRuntime } from "./dashboard";
import { runBudgetNarrativeComposerRuntime } from "./budget-narrative";
import { runCompetitiveNarrativeComposerRuntime } from "./competitive-narrative";
import { runEquipmentPlanComposerRuntime } from "./equipment-plan-composer";
import { runExecutiveComposerRuntime } from "./executive-composer";
import { runProposalContextRuntime } from "./proposal-context";
import { runProposalQualityRuntime } from "./proposal-quality";
import { runProposalVariantComposerRuntime } from "./proposal-variant";
import { runTechnicalComposerRuntime } from "./technical-composer";
import type { BidderProposalComposerEvidence } from "./shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "./shared/types";

export const BIDDER_PROPOSAL_COMPOSER_DOMAINS = [
  "proposal-context",
  "executive-composer",
  "technical-composer",
  "equipment-plan-composer",
  "budget-narrative-composer",
  "competitive-narrative-composer",
  "proposal-variant-composer",
  "proposal-quality",
  "bidder-proposal-dashboard",
] as const;

export function buildBidderProposalComposerEvidence(input?: {
  deploymentId?: string;
}): BidderProposalComposerEvidence {
  const deploymentId = input?.deploymentId ?? "bidder-proposal-composer-default";

  const runtimes = [
    runProposalContextRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runExecutiveComposerRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runTechnicalComposerRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runEquipmentPlanComposerRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runBudgetNarrativeComposerRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runCompetitiveNarrativeComposerRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runProposalVariantComposerRuntime({ deploymentId }),
    runProposalQualityRuntime({ deploymentId }),
    runBidderProposalDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Bidder proposal composer evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-bidder-proposal-composer-${deploymentId}`,
    version: BIDDER_PROPOSAL_COMPOSER_VERSION,
    domains: [...BIDDER_PROPOSAL_COMPOSER_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `bidder-proposal-composer-evidence domains=${BIDDER_PROPOSAL_COMPOSER_DOMAINS.length} allSuccess=true`,
  };
}
