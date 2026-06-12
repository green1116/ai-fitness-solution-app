import { runBudgetJustificationRuntime } from "./budget-justification";
import { runDeliveryReadinessRuntime } from "./delivery-readiness";
import { runLifecycleCostRuntime } from "./lifecycle-cost";
import { runMaintenanceNarrativeRuntime } from "./maintenance-narrative";
import { runProposalDeliveryPackageRuntime } from "./proposal-delivery-package";
import { runProposalPackagingDashboardRuntime } from "./dashboard";
import { runROINarrativeRuntime } from "./roi-narrative";
import { runTCORuntime } from "./tco-runtime";
import type { ProposalDeliveryPackagingEvidence } from "./shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "./shared/types";

export const PROPOSAL_DELIVERY_PACKAGING_DOMAINS = [
  "budget-justification",
  "lifecycle-cost",
  "maintenance-narrative",
  "roi-narrative",
  "tco-runtime",
  "proposal-delivery-package",
  "delivery-readiness",
  "proposal-packaging-dashboard",
] as const;

export function buildProposalDeliveryPackagingEvidence(input?: {
  deploymentId?: string;
}): ProposalDeliveryPackagingEvidence {
  const deploymentId = input?.deploymentId ?? "proposal-delivery-packaging-default";

  const runtimes = [
    runBudgetJustificationRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runLifecycleCostRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runMaintenanceNarrativeRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runROINarrativeRuntime({ deploymentId, bidderBrand: "Technogym" }),
    runTCORuntime({ deploymentId, bidderBrand: "Technogym" }),
    runProposalDeliveryPackageRuntime({ deploymentId }),
    runDeliveryReadinessRuntime({ deploymentId }),
    runProposalPackagingDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Proposal delivery packaging evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-proposal-delivery-packaging-${deploymentId}`,
    version: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    domains: [...PROPOSAL_DELIVERY_PACKAGING_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `proposal-delivery-packaging-evidence domains=${PROPOSAL_DELIVERY_PACKAGING_DOMAINS.length} allSuccess=true`,
  };
}
