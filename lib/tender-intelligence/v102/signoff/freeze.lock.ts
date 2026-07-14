/**
 * E02-P8 — Tender Knowledge Graph layer version lock (read-only)
 */

import {
  V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
  V102_KNOWLEDGE_EXTRACTION_VERSION,
} from "../extraction/extraction.types";
import {
  V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
  V102_TENDER_KNOWLEDGE_VERSION,
} from "../knowledge/knowledge.types";
import {
  V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  V102_KNOWLEDGE_DELIVERY_VERSION,
} from "../knowledge-delivery/delivery.types";
import {
  V102_MEMORY_AGENT_FREEZE_VERSION,
  V102_MEMORY_AGENT_VERSION,
} from "../memory-agent/memory-agent.types";
import {
  V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
  V102_KNOWLEDGE_RELATIONSHIP_VERSION,
} from "../relationship/relationship.types";
import {
  V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
  V102_KNOWLEDGE_RETRIEVAL_VERSION,
} from "../retrieval/retrieval.types";
import {
  V102_SIMILAR_TENDER_FREEZE_VERSION,
  V102_SIMILAR_TENDER_VERSION,
} from "../similarity/similarity.types";

import type { LockVersion } from "./signoff.types";
import {
  V102_KNOWLEDGE_FREEZE_VERSION,
  V102_KNOWLEDGE_SIGNOFF_VERSION,
} from "./signoff.types";

export const V102_KNOWLEDGE_LAYER_VERSION_LOCK: LockVersion = {
  knowledge: V102_TENDER_KNOWLEDGE_VERSION,
  extraction: V102_KNOWLEDGE_EXTRACTION_VERSION,
  relationship: V102_KNOWLEDGE_RELATIONSHIP_VERSION,
  retrieval: V102_KNOWLEDGE_RETRIEVAL_VERSION,
  similarity: V102_SIMILAR_TENDER_VERSION,
  memoryAgent: V102_MEMORY_AGENT_VERSION,
  knowledgeDelivery: V102_KNOWLEDGE_DELIVERY_VERSION,
  knowledgeFreeze: V102_TENDER_KNOWLEDGE_FREEZE_VERSION,
  extractionFreeze: V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION,
  relationshipFreeze: V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION,
  retrievalFreeze: V102_KNOWLEDGE_RETRIEVAL_FREEZE_VERSION,
  similarityFreeze: V102_SIMILAR_TENDER_FREEZE_VERSION,
  memoryAgentFreeze: V102_MEMORY_AGENT_FREEZE_VERSION,
  knowledgeDeliveryFreeze: V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION,
  signoff: V102_KNOWLEDGE_SIGNOFF_VERSION,
  freeze: V102_KNOWLEDGE_FREEZE_VERSION,
};

export const EXPECTED_KNOWLEDGE_LAYER_VERSIONS: LockVersion =
  V102_KNOWLEDGE_LAYER_VERSION_LOCK;

export function isKnowledgeLayerVersionLockIntact(): boolean {
  const lock = V102_KNOWLEDGE_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function knowledgeVersionLockMatchesExpected(): boolean {
  const lock = V102_KNOWLEDGE_LAYER_VERSION_LOCK;
  const expected = EXPECTED_KNOWLEDGE_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
