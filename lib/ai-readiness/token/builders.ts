import type { TokenUsage } from "./types";

export function buildTokenUsage(input?: {
  deploymentId?: string;
  promptTokens?: number;
  completionTokens?: number;
}): TokenUsage {
  const deploymentId = input?.deploymentId ?? "token-default";
  const promptTokens = input?.promptTokens ?? 1240;
  const completionTokens = input?.completionTokens ?? 680;
  return {
    usageId: `token-usage-${deploymentId}`,
    requestId: `completion-req-${deploymentId}`,
    modelId: `gpt-4o-${deploymentId}`,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    mode: "readiness-stub",
  };
}

export function buildTokenUsageSamples(input?: {
  deploymentId?: string;
}): TokenUsage[] {
  const deploymentId = input?.deploymentId ?? "token-default";
  return [
    buildTokenUsage({ deploymentId, promptTokens: 1240, completionTokens: 680 }),
    buildTokenUsage({ deploymentId, promptTokens: 3200, completionTokens: 1500 }),
    buildTokenUsage({ deploymentId, promptTokens: 800, completionTokens: 420 }),
  ].map((usage, index) => ({
    ...usage,
    usageId: `token-sample-${deploymentId}-${index}`,
  }));
}
