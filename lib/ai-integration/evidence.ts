import { runAiAuditRuntime } from "./audit";
import { runAiCostControlRuntime } from "./cost-control";
import { runAiGenerationDashboardRuntime } from "./dashboard";
import { runAiKnowledgeFusionRuntime } from "./knowledge-fusion";
import { runModelRoutingRuntime } from "./model-routing";
import { runAiProviderAdapterRuntime } from "./provider-adapter";
import { runPromptOrchestrationRuntime } from "./prompt-orchestration";
import { runAiSafetyRuntime } from "./safety";
import type { AiIntegrationEvidence } from "./shared/types";
import { AI_INTEGRATION_VERSION } from "./shared/types";

export const AI_INTEGRATION_DOMAINS = [
  "ai-provider-adapter",
  "prompt-orchestration",
  "model-routing",
  "ai-safety",
  "ai-cost-control",
  "ai-audit",
  "ai-knowledge-fusion",
  "ai-generation-dashboard",
] as const;

export function buildAiIntegrationEvidence(input?: {
  deploymentId?: string;
}): AiIntegrationEvidence {
  const deploymentId = input?.deploymentId ?? "ai-integration-default";

  const runtimes = [
    runAiProviderAdapterRuntime({ deploymentId, forceMode: "stub" }),
    runPromptOrchestrationRuntime({ deploymentId }),
    runModelRoutingRuntime({ deploymentId }),
    runAiSafetyRuntime({ deploymentId }),
    runAiCostControlRuntime({ deploymentId }),
    runAiAuditRuntime({ deploymentId }),
    runAiKnowledgeFusionRuntime({ deploymentId }),
    runAiGenerationDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`AI integration evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-ai-integration-${deploymentId}`,
    version: AI_INTEGRATION_VERSION,
    domains: [...AI_INTEGRATION_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `ai-integration-evidence domains=${AI_INTEGRATION_DOMAINS.length} allSuccess=true`,
  };
}
