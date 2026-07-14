/**
 * E04-P6 — Business Knowledge Runtime constants
 * BASE: enterprise-e04-p5-business-memory-runtime-v1
 */

export const E04_KNOWLEDGE_RUNTIME_ID =
  "enterprise-e04-business-knowledge-runtime-v1" as const;

export const E04_KNOWLEDGE_VERSION = "e04-knowledge-1" as const;
export const E04_KNOWLEDGE_FREEZE_VERSION = "e04-knowledge-freeze-1" as const;

export const E04_KNOWLEDGE_BASE =
  "enterprise-e04-p5-business-memory-runtime-v1" as const;

export const KNOWLEDGE_ENTITY_KINDS = [
  "project",
  "organization",
  "equipment",
  "requirement",
  "capability",
  "policy",
  "artifact",
] as const;

export const KNOWLEDGE_RELATION_KINDS = [
  "owns",
  "requires",
  "supports",
  "references",
  "derived_from",
  "constrains",
] as const;

export const KNOWLEDGE_TRACE_EVENT_KINDS = [
  "register",
  "link",
  "retrieve",
  "validate",
  "result",
  "error",
] as const;
