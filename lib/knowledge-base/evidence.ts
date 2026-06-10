import { runKnowledgeAssemblyRuntime } from "./assembly";
import { runComplianceKnowledgeRuntime } from "./compliance";
import { runKnowledgeDashboardRuntime } from "./dashboard";
import { runEquipmentKnowledgeRuntime } from "./equipment";
import { runKnowledgeCatalogRuntime } from "./catalog";
import { runProjectKnowledgeRuntime } from "./project";
import { runProposalKnowledgeRuntime } from "./proposal";
import { runRiskKnowledgeRuntime } from "./risk";
import { runKnowledgeSearchRuntime } from "./search";
import type { KnowledgeBaseEvidence } from "./shared/types";
import { KNOWLEDGE_BASE_VERSION } from "./shared/types";

export const KNOWLEDGE_BASE_DOMAINS = [
  "project-knowledge",
  "equipment-knowledge",
  "proposal-knowledge",
  "risk-knowledge",
  "compliance-knowledge",
  "knowledge-catalog",
  "knowledge-search",
  "knowledge-assembly",
  "knowledge-dashboard",
] as const;

export function buildKnowledgeBaseEvidence(input?: {
  deploymentId?: string;
}): KnowledgeBaseEvidence {
  const deploymentId = input?.deploymentId ?? "knowledge-base-default";

  const runtimes = [
    runProjectKnowledgeRuntime({ deploymentId }),
    runEquipmentKnowledgeRuntime({ deploymentId }),
    runProposalKnowledgeRuntime({ deploymentId }),
    runRiskKnowledgeRuntime({ deploymentId }),
    runComplianceKnowledgeRuntime({ deploymentId }),
    runKnowledgeCatalogRuntime({ deploymentId }),
    runKnowledgeSearchRuntime({ deploymentId }),
    runKnowledgeAssemblyRuntime({ deploymentId }),
    runKnowledgeDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Knowledge base evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-knowledge-base-${deploymentId}`,
    version: KNOWLEDGE_BASE_VERSION,
    domains: [...KNOWLEDGE_BASE_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `knowledge-base-evidence domains=${KNOWLEDGE_BASE_DOMAINS.length} allSuccess=true`,
  };
}
