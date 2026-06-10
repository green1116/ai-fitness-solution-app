import { runAiAdapterRuntime } from "./adapter";
import { runCompletionRuntime } from "./completion";
import { runCostRuntime } from "./cost";
import { runAiReadinessDashboardRuntime } from "./dashboard";
import { runModelRuntime } from "./model";
import { runAiProviderRuntime } from "./provider";
import { runPromptRuntime } from "./prompt";
import type { AiReadinessEvidence } from "./shared/types";
import { AI_READINESS_VERSION } from "./shared/types";
import { runTokenRuntime } from "./token";

export const AI_READINESS_DOMAINS = [
  "ai-provider",
  "model-runtime",
  "prompt-runtime",
  "completion-runtime",
  "token-runtime",
  "cost-runtime",
  "ai-adapter",
  "ai-readiness",
] as const;

export function buildAiReadinessEvidence(input?: {
  deploymentId?: string;
}): AiReadinessEvidence {
  const deploymentId = input?.deploymentId ?? "ai-readiness-default";

  const runtimes = [
    runAiProviderRuntime({ deploymentId }),
    runModelRuntime({ deploymentId }),
    runPromptRuntime({ deploymentId }),
    runCompletionRuntime({ deploymentId }),
    runTokenRuntime({ deploymentId }),
    runCostRuntime({ deploymentId }),
    runAiAdapterRuntime({ deploymentId }),
    runAiReadinessDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`AI readiness evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-ai-readiness-${deploymentId}`,
    version: AI_READINESS_VERSION,
    domains: [...AI_READINESS_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `ai-readiness-evidence domains=${AI_READINESS_DOMAINS.length} allSuccess=true`,
  };
}
