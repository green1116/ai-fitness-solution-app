import type { AiProviderId } from "../provider-adapter/types";
import type { RoutingCapability, RoutingDecision, RoutingRule } from "./types";

const MODEL_BY_PROVIDER: Record<AiProviderId, string> = {
  openai: "gpt-4o",
  claude: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-pro",
  deepseek: "deepseek-chat",
  qwen: "qwen-max",
};

export function buildRoutingRules(input?: { deploymentId?: string }): RoutingRule[] {
  const deploymentId = input?.deploymentId ?? "routing-default";
  const rules: Array<Omit<RoutingRule, "ruleId">> = [
    {
      capability: "high-quality-proposal",
      primaryProvider: "openai",
      primaryModel: MODEL_BY_PROVIDER.openai,
      fallbackProviders: ["claude", "gemini"],
      description: "高质量方案生成优先 GPT-4o，失败降级 Claude/Gemini",
    },
    {
      capability: "low-cost-summary",
      primaryProvider: "deepseek",
      primaryModel: MODEL_BY_PROVIDER.deepseek,
      fallbackProviders: ["qwen", "openai"],
      description: "低成本摘要优先 DeepSeek，失败降级 Qwen/OpenAI",
    },
    {
      capability: "structured-output",
      primaryProvider: "openai",
      primaryModel: MODEL_BY_PROVIDER.openai,
      fallbackProviders: ["deepseek", "qwen"],
      description: "结构化输出优先 JSON-mode 模型",
    },
    {
      capability: "fallback",
      primaryProvider: "qwen",
      primaryModel: MODEL_BY_PROVIDER.qwen,
      fallbackProviders: ["deepseek"],
      description: "全局兜底路由",
    },
  ];

  return rules.map((r) => ({
    ruleId: `rule-${r.capability}-${deploymentId}`,
    ...r,
  }));
}

export function resolveRoutingDecision(input: {
  deploymentId: string;
  capability: RoutingCapability;
  failedProviders?: AiProviderId[];
}): RoutingDecision {
  const rules = buildRoutingRules({ deploymentId: input.deploymentId });
  const rule = rules.find((r) => r.capability === input.capability) ?? rules[rules.length - 1];
  const failed = new Set(input.failedProviders ?? []);

  let selectedProvider = rule.primaryProvider;
  let usedFallback = false;
  let reason = `primary=${rule.primaryProvider}`;

  if (failed.has(rule.primaryProvider)) {
    const fallback = rule.fallbackProviders.find((p) => !failed.has(p));
    if (fallback) {
      selectedProvider = fallback;
      usedFallback = true;
      reason = `fallback=${fallback} after ${rule.primaryProvider} failed`;
    } else {
      usedFallback = true;
      reason = `exhausted-fallback chain for ${input.capability}`;
    }
  }

  return {
    decisionId: `decision-${input.capability}-${input.deploymentId}`,
    capability: input.capability,
    selectedProvider,
    selectedModel: MODEL_BY_PROVIDER[selectedProvider],
    usedFallback,
    reason,
  };
}

export function runRoutingScenarios(deploymentId: string): RoutingDecision[] {
  return [
    resolveRoutingDecision({ deploymentId, capability: "high-quality-proposal" }),
    resolveRoutingDecision({ deploymentId, capability: "low-cost-summary" }),
    resolveRoutingDecision({ deploymentId, capability: "structured-output" }),
    resolveRoutingDecision({
      deploymentId,
      capability: "high-quality-proposal",
      failedProviders: ["openai"],
    }),
  ];
}
