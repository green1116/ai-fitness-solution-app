/**
 * Product M14 — Intelligence governance standard registry (in-memory)
 */

import {
  INTELLIGENCE_GOVERNANCE_STANDARD_KINDS,
  INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES,
} from "./governance.constants";
import type {
  IntelligenceGovernanceStandard,
  IntelligenceGovernanceStandardKind,
  IntelligenceGovernanceStandardStatus,
  RegisterIntelligenceGovernanceStandardInput,
  UpdateIntelligenceGovernanceStandardStatusInput,
} from "./governance.types";

const standards = new Map<string, IntelligenceGovernanceStandard>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStandard(
  standard: IntelligenceGovernanceStandard,
): IntelligenceGovernanceStandard {
  return { ...standard, metadata: { ...standard.metadata } };
}

export function registerIntelligenceGovernanceStandard(
  input: RegisterIntelligenceGovernanceStandardInput,
): IntelligenceGovernanceStandard {
  const standardKey = input.standardKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!standardKey) throw new Error("standard.standardKey is required");
  if (!title) throw new Error("standard.title is required");
  if (!summary) throw new Error("standard.summary is required");
  if (
    !(INTELLIGENCE_GOVERNANCE_STANDARD_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid standard kind: ${input.kind}`);
  }
  if (keys.has(standardKey)) {
    throw new Error(`standardKey already exists: ${standardKey}`);
  }

  const id = input.id?.trim() || createId("intgovstd");
  if (standards.has(id)) throw new Error(`standard already exists: ${id}`);

  const now = nowIso();
  const standard: IntelligenceGovernanceStandard = {
    id,
    standardKey,
    kind: input.kind,
    status: INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES[0],
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

export function updateIntelligenceGovernanceStandardStatus(
  input: UpdateIntelligenceGovernanceStandardStatusInput,
): IntelligenceGovernanceStandard {
  const standardId = input.standardId.trim();
  if (!standardId) throw new Error("standard.standardId is required");
  if (
    !(INTELLIGENCE_GOVERNANCE_STANDARD_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid standard status: ${input.status}`);
  }

  const existing = standards.get(standardId);
  if (!existing) throw new Error(`standard not found: ${standardId}`);

  const updated: IntelligenceGovernanceStandard = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  standards.set(standardId, updated);
  return cloneStandard(updated);
}

export function getIntelligenceGovernanceStandard(
  id: string,
): IntelligenceGovernanceStandard | undefined {
  const standard = standards.get(id.trim());
  return standard ? cloneStandard(standard) : undefined;
}

export function listIntelligenceGovernanceStandards(filter?: {
  kind?: IntelligenceGovernanceStandardKind;
  status?: IntelligenceGovernanceStandardStatus;
}): IntelligenceGovernanceStandard[] {
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

export function clearIntelligenceGovernanceStandards(): void {
  standards.clear();
  keys.clear();
}
