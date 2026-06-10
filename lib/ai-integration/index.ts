/**
 * V13 Real AI Integration Foundation — unified AI provider layer with stub/real dual mode.
 * All AI calls go through provider adapter; supports fallback, cost control, safety, audit.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export {
  resolveAiIntegrationMode,
  hasProviderApiKey,
  AI_PROVIDER_ENV_KEYS,
} from "./shared/mode";
export * from "./provider-adapter";
export * from "./prompt-orchestration";
export * from "./model-routing";
export * from "./safety";
export * from "./cost-control";
export * from "./audit";
export * from "./knowledge-fusion";
export * from "./dashboard";
export {
  AI_INTEGRATION_DOMAINS,
  buildAiIntegrationEvidence,
} from "./evidence";
export { generateWithGateway, resolveCostLimits } from "./gateway";
export type { GatewayGenerateInput, GatewayGenerateResult } from "./gateway";
