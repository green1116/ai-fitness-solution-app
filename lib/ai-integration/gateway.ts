import { recordAiAudit } from "./audit/builders";
import { aggregateUsage, checkCostAllowed, resolveCostLimits } from "./cost-control/builders";
import { resolveRoutingDecision } from "./model-routing/builders";
import { createProviderAdapter } from "./provider-adapter/builders";
import { buildPromptTemplates, buildPromptTrace, PROMPT_VERSION } from "./prompt-orchestration/builders";
import { sanitizeInput, validateOutput } from "./safety/builders";
import type { AiGenerationRequest, AiGenerationResponse } from "./shared/types";
import { resolveAiIntegrationMode } from "./shared/mode";

export interface GatewayGenerateInput extends AiGenerationRequest {
  capability?: "high-quality-proposal" | "low-cost-summary" | "structured-output";
  method?: "text" | "structured" | "proposal" | "compliance" | "risk";
}

export interface GatewayGenerateResult {
  response: AiGenerationResponse;
  routingReason: string;
  promptVersion: string;
  costAllowed: boolean;
  safetyPassed: boolean;
}

export function generateWithGateway(input: GatewayGenerateInput): GatewayGenerateResult {
  const mode = resolveAiIntegrationMode({ forceMode: input.forceMode });
  const capability = input.capability ?? "high-quality-proposal";
  const method = input.method ?? "text";

  const routing = resolveRoutingDecision({
    deploymentId: input.deploymentId,
    capability,
  });

  const { sanitized } = sanitizeInput(input.prompt);
  const templates = buildPromptTemplates({ deploymentId: input.deploymentId });
  const trace = buildPromptTrace({
    deploymentId: input.deploymentId,
    templates,
    projectName: sanitized.slice(0, 40),
  });

  const adapter = createProviderAdapter(routing.selectedProvider, { forceMode: mode });
  const req: AiGenerationRequest = {
    ...input,
    prompt: trace.assembledPrompt,
    systemPrompt: templates.find((t) => t.kind === "system")?.content,
    providerId: routing.selectedProvider,
    modelId: routing.selectedModel,
  };

  let response: AiGenerationResponse;
  switch (method) {
    case "structured":
      response = adapter.generateStructuredOutput(req);
      break;
    case "proposal":
      response = adapter.generateProposalDraft(req);
      break;
    case "compliance":
      response = adapter.generateComplianceDraft(req);
      break;
    case "risk":
      response = adapter.generateRiskDraft(req);
      break;
    default:
      response = adapter.generateText(req);
  }

  const outputCheck = validateOutput(response.content);
  const usage = aggregateUsage([response]);
  const costAllowed = checkCostAllowed(usage);

  recordAiAudit({
    deploymentId: input.deploymentId,
    response,
    outputType: method,
    promptVersion: PROMPT_VERSION,
  });

  return {
    response: {
      ...response,
      success: response.success && outputCheck.valid && costAllowed,
    },
    routingReason: routing.reason,
    promptVersion: PROMPT_VERSION,
    costAllowed,
    safetyPassed: outputCheck.valid,
  };
}

export { resolveCostLimits };
