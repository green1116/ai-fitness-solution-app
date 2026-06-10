import { runAiAuditRuntime } from "../audit/runtime";
import { runAiCostControlRuntime } from "../cost-control/runtime";
import { runAiKnowledgeFusionRuntime } from "../knowledge-fusion/runtime";
import { runModelRoutingRuntime } from "../model-routing/runtime";
import { runAiProviderAdapterRuntime } from "../provider-adapter/runtime";
import { runPromptOrchestrationRuntime } from "../prompt-orchestration/runtime";
import { runAiSafetyRuntime } from "../safety/runtime";

export function buildAiGenerationDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  providerReadiness: number;
  modelReadiness: number;
  promptReadiness: number;
  safetyReadiness: number;
  costReadiness: number;
  auditReadiness: number;
  generationReadiness: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const adapter = runAiProviderAdapterRuntime({ deploymentId, forceMode: "stub" });
  const routing = runModelRoutingRuntime({ deploymentId });
  const prompt = runPromptOrchestrationRuntime({ deploymentId });
  const safety = runAiSafetyRuntime({ deploymentId });
  const cost = runAiCostControlRuntime({ deploymentId });
  const audit = runAiAuditRuntime({ deploymentId });
  const fusion = runAiKnowledgeFusionRuntime({ deploymentId });

  const providerReadiness =
    adapter.status === "success" ? (adapter.payload.supportedProviders.length / 5) * 100 : 0;
  const modelReadiness = routing.status === "success" ? 100 : 0;
  const promptReadiness =
    prompt.status === "success" ? (prompt.payload.templates.length / 5) * 100 : 0;
  const safetyReadiness =
    safety.status === "success" && safety.payload.allPassed ? 100 : 0;
  const costReadiness =
    cost.status === "success" && cost.payload.usage.withinDailyLimit ? 100 : 0;
  const auditReadiness =
    audit.status === "success" ? (audit.payload.recordCount >= 5 ? 100 : 80) : 0;
  const generationReadiness = fusion.status === "success" ? 100 : 0;

  return {
    providerReadiness,
    modelReadiness,
    promptReadiness,
    safetyReadiness,
    costReadiness,
    auditReadiness,
    generationReadiness,
    summary: `ai-generation-dashboard provider=${providerReadiness}% model=${modelReadiness}% prompt=${promptReadiness}% safety=${safetyReadiness}% cost=${costReadiness}% audit=${auditReadiness}% generation=${generationReadiness}%`,
  };
}
