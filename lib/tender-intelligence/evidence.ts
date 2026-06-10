import { runTenderIntelligenceAssemblyRuntime } from "./assembly";
import { runBudgetIntelligenceRuntime } from "./budget";
import { runProjectClassificationRuntime } from "./classification";
import { runComplianceIntelligenceRuntime } from "./compliance";
import { runTenderDashboardRuntime } from "./dashboard";
import { runEquipmentIntelligenceRuntime } from "./equipment";
import { runRiskIntelligenceRuntime } from "./risk";
import { runProjectScaleRuntime } from "./scale";
import type { TenderIntelligenceEvidence } from "./shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "./shared/types";

export const TENDER_INTELLIGENCE_DOMAINS = [
  "project-classification",
  "project-scale",
  "risk-intelligence",
  "equipment-intelligence",
  "budget-intelligence",
  "compliance-intelligence",
  "tender-intelligence",
  "tender-dashboard",
] as const;

export function buildTenderIntelligenceEvidence(input?: {
  deploymentId?: string;
}): TenderIntelligenceEvidence {
  const deploymentId = input?.deploymentId ?? "tender-intelligence-default";

  const runtimes = [
    runProjectClassificationRuntime({ deploymentId }),
    runProjectScaleRuntime({ deploymentId }),
    runRiskIntelligenceRuntime({ deploymentId }),
    runEquipmentIntelligenceRuntime({ deploymentId }),
    runBudgetIntelligenceRuntime({ deploymentId }),
    runComplianceIntelligenceRuntime({ deploymentId }),
    runTenderIntelligenceAssemblyRuntime({ deploymentId }),
    runTenderDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Tender intelligence evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-tender-intelligence-${deploymentId}`,
    version: TENDER_INTELLIGENCE_VERSION,
    domains: [...TENDER_INTELLIGENCE_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `tender-intelligence-evidence domains=${TENDER_INTELLIGENCE_DOMAINS.length} allSuccess=true`,
  };
}
