import { runAutopilotAuditRuntime } from "./audit";
import { runAutopilotDashboardRuntime } from "./dashboard";
import { runDeliveryRuntime } from "./delivery";
import { runAutopilotJobRuntime } from "./job";
import { runHumanReviewRuntime } from "./human-review";
import { runRetryRuntime } from "./retry";
import type { AutopilotEvidence } from "./shared/types";
import { AUTOPILOT_VERSION } from "./shared/types";
import { runStageOrchestrationRuntime } from "./stage-orchestration";
import { runWorkflowRuntime } from "./workflow";

export const AUTOPILOT_DOMAINS = [
  "autopilot-job",
  "workflow",
  "stage-orchestration",
  "retry-runtime",
  "human-review",
  "delivery-runtime",
  "autopilot-audit",
  "autopilot-dashboard",
] as const;

export function buildAutopilotEvidence(input?: {
  deploymentId?: string;
}): AutopilotEvidence {
  const deploymentId = input?.deploymentId ?? "autopilot-default";

  const runtimes = [
    runAutopilotJobRuntime({ deploymentId }),
    runWorkflowRuntime({ deploymentId }),
    runStageOrchestrationRuntime({ deploymentId }),
    runRetryRuntime({ deploymentId }),
    runHumanReviewRuntime({ deploymentId }),
    runDeliveryRuntime({ deploymentId }),
    runAutopilotAuditRuntime({ deploymentId }),
    runAutopilotDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Autopilot evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-autopilot-${deploymentId}`,
    version: AUTOPILOT_VERSION,
    domains: [...AUTOPILOT_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `autopilot-evidence domains=${AUTOPILOT_DOMAINS.length} allSuccess=true`,
  };
}
