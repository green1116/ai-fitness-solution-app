import type { AI_INTEGRATION_VERSION } from "../shared/types";
import type { AiProviderId } from "../provider-adapter/types";

export const MODEL_ROUTING_RUNTIME_VERSION = "v13.0-model-routing-1" as const;

export type RoutingCapability =
  | "high-quality-proposal"
  | "low-cost-summary"
  | "structured-output"
  | "fallback";

export interface RoutingRule {
  ruleId: string;
  capability: RoutingCapability;
  primaryProvider: AiProviderId;
  primaryModel: string;
  fallbackProviders: AiProviderId[];
  description: string;
}

export interface RoutingDecision {
  decisionId: string;
  capability: RoutingCapability;
  selectedProvider: AiProviderId;
  selectedModel: string;
  usedFallback: boolean;
  reason: string;
}

export interface ModelRoutingRuntimePayload {
  version: typeof MODEL_ROUTING_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  rules: RoutingRule[];
  decisions: RoutingDecision[];
  summary: string;
}
