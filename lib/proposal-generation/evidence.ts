import { runProposalAssemblyRuntime } from "./assembly";
import { runComplianceMatrixRuntime } from "./compliance-matrix";
import { runProposalDashboardRuntime } from "./dashboard";
import { runDeliveryScheduleRuntime } from "./delivery-schedule";
import { runExecutiveSummaryRuntime } from "./executive-summary";
import { runImplementationPlanRuntime } from "./implementation-plan";
import { runRiskAnalysisRuntime } from "./risk-analysis";
import type { ProposalGenerationEvidence } from "./shared/types";
import { PROPOSAL_GENERATION_VERSION } from "./shared/types";
import { runTechnicalProposalRuntime } from "./technical-proposal";

export const PROPOSAL_GENERATION_DOMAINS = [
  "executive-summary",
  "technical-proposal",
  "implementation-plan",
  "risk-analysis",
  "delivery-schedule",
  "compliance-matrix",
  "proposal-assembly",
  "proposal-dashboard",
] as const;

export function buildProposalGenerationEvidence(input?: {
  deploymentId?: string;
}): ProposalGenerationEvidence {
  const deploymentId = input?.deploymentId ?? "proposal-generation-default";

  const runtimes = [
    runExecutiveSummaryRuntime({ deploymentId }),
    runTechnicalProposalRuntime({ deploymentId }),
    runImplementationPlanRuntime({ deploymentId }),
    runRiskAnalysisRuntime({ deploymentId }),
    runDeliveryScheduleRuntime({ deploymentId }),
    runComplianceMatrixRuntime({ deploymentId }),
    runProposalAssemblyRuntime({ deploymentId }),
    runProposalDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Proposal generation evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-proposal-generation-${deploymentId}`,
    version: PROPOSAL_GENERATION_VERSION,
    domains: [...PROPOSAL_GENERATION_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `proposal-generation-evidence domains=${PROPOSAL_GENERATION_DOMAINS.length} allSuccess=true`,
  };
}
