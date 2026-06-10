import { resolveAiIntegrationMode } from "../shared/mode";
import type { AiGenerationRequest } from "../shared/types";
import { createRealCapableAdapter } from "./real-adapter";
import { createStubAdapter } from "./stub-adapter";
import type { AiGenerationResponse } from "../shared/types";
import type { AiProviderAdapter, AiProviderId } from "./types";
import { AI_PROVIDER_IDS } from "./types";

export function createProviderAdapter(
  providerId: AiProviderId,
  input?: { forceMode?: "stub" | "real" },
): AiProviderAdapter {
  const mode = resolveAiIntegrationMode({ forceMode: input?.forceMode });
  if (mode === "real") return createRealCapableAdapter(providerId);
  return createStubAdapter(providerId);
}

export function buildAllProviderAdapters(input?: {
  deploymentId?: string;
  forceMode?: "stub" | "real";
}): AiProviderAdapter[] {
  return AI_PROVIDER_IDS.map((providerId) => createProviderAdapter(providerId, input));
}

export function runAdapterSmokeTests(input: {
  deploymentId: string;
  forceMode?: "stub" | "real";
}): AiGenerationResponse[] {
  const adapters = buildAllProviderAdapters({ forceMode: input.forceMode });
  const primary = adapters[0];
  const req: AiGenerationRequest = {
    deploymentId: input.deploymentId,
    prompt: "政府健身中心采购项目技术方案生成",
    systemPrompt: "你是专业投标方案顾问",
    task: "smoke-test",
    forceMode: input.forceMode,
  };

  return [
    primary.generateText(req),
    primary.generateStructuredOutput(req),
    primary.generateProposalDraft(req),
    primary.generateComplianceDraft(req),
    primary.generateRiskDraft(req),
  ];
}

export { AI_PROVIDER_IDS };
