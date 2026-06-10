import type { AiProviderDefinition, AiProviderId } from "./types";

export const AI_PROVIDER_IDS: AiProviderId[] = [
  "openai",
  "claude",
  "gemini",
  "deepseek",
  "qwen",
];

const PROVIDER_META: Record<
  AiProviderId,
  { displayName: string; apiBaseUrl: string; description: string }
> = {
  openai: {
    displayName: "OpenAI",
    apiBaseUrl: "https://api.openai.com/v1/stub",
    description: "GPT 系列模型提供商（readiness-stub）",
  },
  claude: {
    displayName: "Claude",
    apiBaseUrl: "https://api.anthropic.com/v1/stub",
    description: "Anthropic Claude 系列（readiness-stub）",
  },
  gemini: {
    displayName: "Gemini",
    apiBaseUrl: "https://generativelanguage.googleapis.com/v1/stub",
    description: "Google Gemini 系列（readiness-stub）",
  },
  deepseek: {
    displayName: "DeepSeek",
    apiBaseUrl: "https://api.deepseek.com/v1/stub",
    description: "DeepSeek 系列（readiness-stub）",
  },
  qwen: {
    displayName: "Qwen",
    apiBaseUrl: "https://dashscope.aliyuncs.com/api/v1/stub",
    description: "通义千问系列（readiness-stub）",
  },
};

export function buildAiProviderDefinitions(): AiProviderDefinition[] {
  return AI_PROVIDER_IDS.map((providerId) => ({
    providerId,
    ...PROVIDER_META[providerId],
    readinessLevel: "contract-ready" as const,
    supportedModes: ["readiness-stub" as const],
  }));
}
