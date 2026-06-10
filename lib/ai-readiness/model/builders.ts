import type { ModelDefinition } from "./types";

export function buildModelDefinitions(input?: {
  deploymentId?: string;
}): ModelDefinition[] {
  const deploymentId = input?.deploymentId ?? "model-default";
  return [
    { modelId: `gpt-4o-${deploymentId}`, providerId: "openai", family: "gpt", displayName: "GPT-4o", contextWindow: 128_000, capabilities: ["chat", "json-mode", "long-context", "vision"] },
    { modelId: `claude-sonnet-${deploymentId}`, providerId: "claude", family: "claude", displayName: "Claude Sonnet", contextWindow: 200_000, capabilities: ["chat", "json-mode", "long-context"] },
    { modelId: `gemini-pro-${deploymentId}`, providerId: "gemini", family: "gemini", displayName: "Gemini Pro", contextWindow: 1_000_000, capabilities: ["chat", "long-context", "vision"] },
    { modelId: `deepseek-chat-${deploymentId}`, providerId: "deepseek", family: "deepseek", displayName: "DeepSeek Chat", contextWindow: 64_000, capabilities: ["chat", "json-mode"] },
    { modelId: `qwen-max-${deploymentId}`, providerId: "qwen", family: "qwen", displayName: "Qwen Max", contextWindow: 32_000, capabilities: ["chat", "completion", "json-mode"] },
  ];
}
