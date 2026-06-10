import type { AiGenerationRequest, AiGenerationResponse } from "../shared/types";
import type { AiProviderAdapter, AiProviderId } from "./types";

const DEFAULT_MODELS: Record<AiProviderId, string> = {
  openai: "gpt-4o",
  claude: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-pro",
  deepseek: "deepseek-chat",
  qwen: "qwen-max",
};

const TOKEN_RATES: Record<AiProviderId, { prompt: number; completion: number }> = {
  openai: { prompt: 0.0000025, completion: 0.00001 },
  claude: { prompt: 0.000003, completion: 0.000015 },
  gemini: { prompt: 0.00000125, completion: 0.000005 },
  deepseek: { prompt: 0.00000014, completion: 0.00000028 },
  qwen: { prompt: 0.000002, completion: 0.000006 },
};

function estimateCost(providerId: AiProviderId, prompt: number, completion: number): number {
  const rate = TOKEN_RATES[providerId];
  return prompt * rate.prompt + completion * rate.completion;
}

function stubResponse(
  providerId: AiProviderId,
  input: AiGenerationRequest,
  content: string,
  structured?: Record<string, unknown>,
): AiGenerationResponse {
  const promptTokens = Math.max(50, Math.ceil(input.prompt.length / 4));
  const completionTokens = Math.max(30, Math.ceil(content.length / 4));
  const started = Date.now();
  return {
    responseId: `resp-stub-${providerId}-${input.deploymentId}-${Date.now()}`,
    providerId,
    modelId: input.modelId ?? DEFAULT_MODELS[providerId],
    content,
    structured,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUsd: estimateCost(providerId, promptTokens, completionTokens),
    },
    mode: "stub",
    usedFallback: false,
    latencyMs: Date.now() - started + 12,
    success: true,
  };
}

export function createStubAdapter(providerId: AiProviderId): AiProviderAdapter {
  const modelId = DEFAULT_MODELS[providerId];
  return {
    adapterId: `adapter-stub-${providerId}`,
    providerId,
    modelId,
    generateText(input) {
      return stubResponse(
        providerId,
        input,
        `【stub/${providerId}】${input.prompt.slice(0, 120)}`,
      );
    },
    generateStructuredOutput(input) {
      return stubResponse(
        providerId,
        input,
        JSON.stringify({ status: "ok", provider: providerId }),
        { status: "ok", provider: providerId, task: input.task ?? "structured" },
      );
    },
    generateProposalDraft(input) {
      return stubResponse(
        providerId,
        input,
        `【stub/${providerId}】投标方案草稿：${input.prompt.slice(0, 80)} — 技术方案、实施计划、交付保障。`,
      );
    },
    generateComplianceDraft(input) {
      return stubResponse(
        providerId,
        input,
        `【stub/${providerId}】合规响应草稿：招标要求逐条映射与偏离说明。`,
        { sections: ["资质", "技术偏离", "商务偏离"], coverage: 0.92 },
      );
    },
    generateRiskDraft(input) {
      return stubResponse(
        providerId,
        input,
        `【stub/${providerId}】风险分析草稿：供应链、施工、验收风险及缓解措施。`,
        { riskLevel: "medium", drivers: ["schedule", "budget"] },
      );
    },
  };
}
