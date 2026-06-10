import { hasProviderApiKey } from "../shared/mode";
import type { AiGenerationRequest, AiGenerationResponse } from "../shared/types";
import { createStubAdapter } from "./stub-adapter";
import type { AiProviderAdapter, AiProviderId } from "./types";

const REAL_ENDPOINTS: Record<AiProviderId, { baseUrl: string; envKey: string; defaultModel: string }> = {
  openai: { baseUrl: "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", defaultModel: "gpt-4o" },
  claude: { baseUrl: "https://api.anthropic.com/v1", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-3-5-sonnet-20241022" },
  gemini: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", envKey: "GOOGLE_API_KEY", defaultModel: "gemini-1.5-pro" },
  deepseek: { baseUrl: "https://api.deepseek.com/v1", envKey: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
  qwen: { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", envKey: "DASHSCOPE_API_KEY", defaultModel: "qwen-max" },
};

async function fetchOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  modelId: string,
  systemPrompt: string | undefined,
  prompt: string,
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const messages = [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    { role: "user" as const, content: prompt },
  ];
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: modelId, messages }),
  });
  if (!res.ok) {
    throw new Error(`Provider API error: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  };
}

function withRealMode(
  providerId: AiProviderId,
  response: AiGenerationResponse,
): AiGenerationResponse {
  const realReady = hasProviderApiKey(providerId);
  return {
    ...response,
    mode: realReady ? "real" : "stub",
    usedFallback: !realReady,
  };
}

export function createRealCapableAdapter(providerId: AiProviderId): AiProviderAdapter {
  const stub = createStubAdapter(providerId);
  const config = REAL_ENDPOINTS[providerId];

  const wrap =
    (fn: (input: AiGenerationRequest) => AiGenerationResponse) =>
    (input: AiGenerationRequest) =>
      withRealMode(providerId, fn(input));

  return {
    adapterId: `adapter-${hasProviderApiKey(providerId) ? "real" : "stub"}-${providerId}`,
    providerId,
    modelId: config.defaultModel,
    generateText: wrap(stub.generateText.bind(stub)),
    generateStructuredOutput: wrap(stub.generateStructuredOutput.bind(stub)),
    generateProposalDraft: wrap(stub.generateProposalDraft.bind(stub)),
    generateComplianceDraft: wrap(stub.generateComplianceDraft.bind(stub)),
    generateRiskDraft: wrap(stub.generateRiskDraft.bind(stub)),
  };
}

export async function invokeRealProvider(
  providerId: AiProviderId,
  input: AiGenerationRequest,
): Promise<AiGenerationResponse> {
  const stub = createStubAdapter(providerId);
  const config = REAL_ENDPOINTS[providerId];
  const apiKey = process.env[config.envKey]?.trim();
  const started = Date.now();

  if (!apiKey) {
    return { ...stub.generateText(input), usedFallback: true };
  }

  try {
    const modelId = input.modelId ?? config.defaultModel;
    const result = await fetchOpenAiCompatible(
      config.baseUrl,
      apiKey,
      modelId,
      input.systemPrompt,
      input.prompt,
    );
    const total = result.promptTokens + result.completionTokens;
    return {
      responseId: `resp-real-${providerId}-${input.deploymentId}`,
      providerId,
      modelId,
      content: result.content,
      tokenUsage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: total,
        estimatedCostUsd: total * 0.000005,
      },
      mode: "real",
      usedFallback: false,
      latencyMs: Date.now() - started,
      success: true,
    };
  } catch (err: unknown) {
    return {
      ...stub.generateText(input),
      mode: "real",
      usedFallback: true,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
