/**
 * V12.5 Knowledge Base Foundation — system-level knowledge asset layer.
 * No vector DB, no embedding, no real AI; decoupled from tender-intelligence production.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./project";
export * from "./equipment";
export * from "./proposal";
export * from "./risk";
export * from "./compliance";
export * from "./catalog";
export * from "./search";
export * from "./assembly";
export * from "./dashboard";
export {
  KNOWLEDGE_BASE_DOMAINS,
  buildKnowledgeBaseEvidence,
} from "./evidence";
