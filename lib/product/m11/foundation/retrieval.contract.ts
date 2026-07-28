/**
 * Product M11 — Knowledge retrieval contract (in-memory, non-vector)
 * Declarative match against registered entities — no RAG / embedding.
 */

import { KNOWLEDGE_RETRIEVAL_MODES } from "./knowledge.constants";
import { listKnowledgeEntities } from "./knowledge.registry";
import type {
  EvaluateKnowledgeRetrievalContractInput,
  KnowledgeEntity,
  KnowledgeRetrievalContract,
  KnowledgeRetrievalHit,
  KnowledgeRetrievalQuery,
} from "./knowledge.types";

const contracts = new Map<string, KnowledgeRetrievalContract>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContract(
  contract: KnowledgeRetrievalContract,
): KnowledgeRetrievalContract {
  return {
    ...contract,
    query: {
      ...contract.query,
      terms: [...contract.query.terms],
      tags: contract.query.tags ? [...contract.query.tags] : undefined,
    },
    hits: contract.hits.map((h) => ({ ...h })),
    metadata: { ...contract.metadata },
  };
}

function normalizeTerms(terms: string[]): string[] {
  return terms.map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function scoreEntity(
  entity: KnowledgeEntity,
  query: KnowledgeRetrievalQuery,
): KnowledgeRetrievalHit | undefined {
  const terms = normalizeTerms(query.terms);
  const tags = (query.tags ?? []).map((t) => t.trim().toLowerCase());

  if (query.kind && entity.kind !== query.kind) return undefined;
  if (query.access && entity.access !== query.access) return undefined;
  if (query.scope && entity.scope !== query.scope) return undefined;
  if (entity.status !== "ACTIVE" && entity.status !== "DRAFT") return undefined;

  if (query.mode === "EXACT") {
    const key = entity.entityKey.toLowerCase();
    if (terms.some((t) => t === key)) {
      return {
        entityId: entity.id,
        entityKey: entity.entityKey,
        kind: entity.kind,
        score: 1,
        matchedOn: "KEY",
      };
    }
    return undefined;
  }

  if (query.mode === "TAG") {
    const needle = tags.length > 0 ? tags : terms;
    const matched = needle.filter((t) => entity.tags.includes(t));
    if (matched.length === 0) return undefined;
    return {
      entityId: entity.id,
      entityKey: entity.entityKey,
      kind: entity.kind,
      score: matched.length / Math.max(needle.length, 1),
      matchedOn: "TAG",
    };
  }

  // KEYWORD — title / summary / key substring match
  const haystacks = [
    { text: entity.entityKey.toLowerCase(), on: "KEY" as const },
    { text: entity.title.toLowerCase(), on: "TITLE" as const },
    { text: entity.summary.toLowerCase(), on: "SUMMARY" as const },
  ];
  for (const term of terms) {
    for (const hay of haystacks) {
      if (hay.text.includes(term)) {
        return {
          entityId: entity.id,
          entityKey: entity.entityKey,
          kind: entity.kind,
          score: term.length / Math.max(hay.text.length, 1),
          matchedOn: hay.on,
        };
      }
    }
  }
  return undefined;
}

export function evaluateKnowledgeRetrievalContract(
  input: EvaluateKnowledgeRetrievalContractInput,
): KnowledgeRetrievalContract {
  const contractKey = input.contractKey.trim().toUpperCase();
  if (!contractKey) throw new Error("contract.contractKey is required");
  if (keys.has(contractKey)) {
    throw new Error(`contractKey already exists: ${contractKey}`);
  }
  if (
    !(KNOWLEDGE_RETRIEVAL_MODES as readonly string[]).includes(
      input.query.mode,
    )
  ) {
    throw new Error(`invalid retrieval mode: ${input.query.mode}`);
  }
  if (!input.query.terms?.length && !input.query.tags?.length) {
    throw new Error("query.terms or query.tags is required");
  }

  const id = input.id?.trim() || createId("knwret");
  if (contracts.has(id)) throw new Error(`contract already exists: ${id}`);

  const hits = listKnowledgeEntities()
    .map((e) => scoreEntity(e, input.query))
    .filter((h): h is KnowledgeRetrievalHit => h !== undefined)
    .sort((a, b) => b.score - a.score || a.entityKey.localeCompare(b.entityKey));

  const contract: KnowledgeRetrievalContract = {
    id,
    contractKey,
    query: {
      ...input.query,
      queryKey: input.query.queryKey.trim().toUpperCase(),
      terms: [...input.query.terms],
      tags: input.query.tags ? [...input.query.tags] : undefined,
    },
    hitCount: hits.length,
    hits,
    detail: `mode=${input.query.mode} hits=${hits.length}`,
    metadata: { ...(input.metadata ?? {}) },
    evaluatedAt: nowIso(),
  };
  contracts.set(id, contract);
  keys.set(contractKey, id);
  return cloneContract(contract);
}

export function getKnowledgeRetrievalContract(
  id: string,
): KnowledgeRetrievalContract | undefined {
  const contract = contracts.get(id.trim());
  return contract ? cloneContract(contract) : undefined;
}

export function listKnowledgeRetrievalContracts(): KnowledgeRetrievalContract[] {
  return [...contracts.values()]
    .slice()
    .sort((a, b) => a.contractKey.localeCompare(b.contractKey))
    .map(cloneContract);
}

export function clearKnowledgeRetrievalContracts(): void {
  contracts.clear();
  keys.clear();
}
