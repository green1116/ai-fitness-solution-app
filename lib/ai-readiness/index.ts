/**
 * V11.5 AI Model Integration Readiness — unified AI runtime adapter layer.
 * No real OpenAI/Claude calls; readiness-stub only.
 * Decoupled from Proposal Engine, Proposal PDF, Plan/Budget engines.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./provider";
export * from "./model";
export * from "./prompt";
export * from "./completion";
export * from "./token";
export * from "./cost";
export * from "./adapter";
export * from "./dashboard";
export {
  AI_READINESS_DOMAINS,
  buildAiReadinessEvidence,
} from "./evidence";
