import type { AiIntegrationMode } from "./types";

export const AI_PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  claude: "ANTHROPIC_API_KEY",
  gemini: "GOOGLE_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  qwen: "DASHSCOPE_API_KEY",
};

export function hasProviderApiKey(providerId: string): boolean {
  const key = AI_PROVIDER_ENV_KEYS[providerId];
  if (!key) return false;
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveAiIntegrationMode(input?: {
  forceMode?: AiIntegrationMode;
}): AiIntegrationMode {
  if (input?.forceMode) return input.forceMode;
  const envMode = process.env.AI_INTEGRATION_MODE?.trim().toLowerCase();
  if (envMode === "stub") return "stub";
  if (envMode === "real") {
    const anyKey = Object.keys(AI_PROVIDER_ENV_KEYS).some(hasProviderApiKey);
    return anyKey ? "real" : "stub";
  }
  return "stub";
}
