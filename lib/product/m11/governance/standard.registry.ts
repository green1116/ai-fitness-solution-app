/**
 * Product M11 — Knowledge governance standard registry (in-memory)
 */

import {
  KNOWLEDGE_GOVERNANCE_STANDARD_KINDS,
  KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES,
} from "./governance.constants";
import type {
  KnowledgeGovernanceStandard,
  KnowledgeGovernanceStandardKind,
  KnowledgeGovernanceStandardStatus,
  RegisterKnowledgeGovernanceStandardInput,
  UpdateKnowledgeGovernanceStandardStatusInput,
} from "./governance.types";

const standards = new Map<string, KnowledgeGovernanceStandard>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStandard(
  standard: KnowledgeGovernanceStandard,
): KnowledgeGovernanceStandard {
  return { ...standard, metadata: { ...standard.metadata } };
}

export function registerKnowledgeGovernanceStandard(
  input: RegisterKnowledgeGovernanceStandardInput,
): KnowledgeGovernanceStandard {
  const standardKey = input.standardKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!standardKey) throw new Error("standard.standardKey is required");
  if (!title) throw new Error("standard.title is required");
  if (!summary) throw new Error("standard.summary is required");
  if (
    !(KNOWLEDGE_GOVERNANCE_STANDARD_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid standard kind: ${input.kind}`);
  }
  if (keys.has(standardKey)) {
    throw new Error(`standardKey already exists: ${standardKey}`);
  }

  const id = input.id?.trim() || createId("knwgovstd");
  if (standards.has(id)) throw new Error(`standard already exists: ${id}`);

  const now = nowIso();
  const standard: KnowledgeGovernanceStandard = {
    id,
    standardKey,
    kind: input.kind,
    status: KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  standards.set(id, standard);
  keys.set(standardKey, id);
  return cloneStandard(standard);
}

export function updateKnowledgeGovernanceStandardStatus(
  input: UpdateKnowledgeGovernanceStandardStatusInput,
): KnowledgeGovernanceStandard {
  const standardId = input.standardId.trim();
  if (!standardId) throw new Error("standard.standardId is required");
  if (
    !(KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid standard status: ${input.status}`);
  }

  const existing = standards.get(standardId);
  if (!existing) throw new Error(`standard not found: ${standardId}`);

  const updated: KnowledgeGovernanceStandard = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  standards.set(standardId, updated);
  return cloneStandard(updated);
}

export function getKnowledgeGovernanceStandard(
  id: string,
): KnowledgeGovernanceStandard | undefined {
  const standard = standards.get(id.trim());
  return standard ? cloneStandard(standard) : undefined;
}

export function listKnowledgeGovernanceStandards(filter?: {
  kind?: KnowledgeGovernanceStandardKind;
  status?: KnowledgeGovernanceStandardStatus;
}): KnowledgeGovernanceStandard[] {
  let result = [...standards.values()];
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.standardKey.localeCompare(b.standardKey))
    .map(cloneStandard);
}

export function clearKnowledgeGovernanceStandards(): void {
  standards.clear();
  keys.clear();
}
