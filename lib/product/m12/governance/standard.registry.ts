/**
 * Product M12 — Agent governance standard registry (in-memory)
 */

import {
  AGENT_GOVERNANCE_STANDARD_KINDS,
  AGENT_GOVERNANCE_STANDARD_STATUSES,
} from "./governance.constants";
import type {
  AgentGovernanceStandard,
  AgentGovernanceStandardKind,
  AgentGovernanceStandardStatus,
  RegisterAgentGovernanceStandardInput,
  UpdateAgentGovernanceStandardStatusInput,
} from "./governance.types";

const standards = new Map<string, AgentGovernanceStandard>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStandard(
  standard: AgentGovernanceStandard,
): AgentGovernanceStandard {
  return { ...standard, metadata: { ...standard.metadata } };
}

export function registerAgentGovernanceStandard(
  input: RegisterAgentGovernanceStandardInput,
): AgentGovernanceStandard {
  const standardKey = input.standardKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!standardKey) throw new Error("standard.standardKey is required");
  if (!title) throw new Error("standard.title is required");
  if (!summary) throw new Error("standard.summary is required");
  if (
    !(AGENT_GOVERNANCE_STANDARD_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid standard kind: ${input.kind}`);
  }
  if (keys.has(standardKey)) {
    throw new Error(`standardKey already exists: ${standardKey}`);
  }

  const id = input.id?.trim() || createId("agtgovstd");
  if (standards.has(id)) throw new Error(`standard already exists: ${id}`);

  const now = nowIso();
  const standard: AgentGovernanceStandard = {
    id,
    standardKey,
    kind: input.kind,
    status: AGENT_GOVERNANCE_STANDARD_STATUSES[0],
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

export function updateAgentGovernanceStandardStatus(
  input: UpdateAgentGovernanceStandardStatusInput,
): AgentGovernanceStandard {
  const standardId = input.standardId.trim();
  if (!standardId) throw new Error("standard.standardId is required");
  if (
    !(AGENT_GOVERNANCE_STANDARD_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid standard status: ${input.status}`);
  }

  const existing = standards.get(standardId);
  if (!existing) throw new Error(`standard not found: ${standardId}`);

  const updated: AgentGovernanceStandard = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  standards.set(standardId, updated);
  return cloneStandard(updated);
}

export function getAgentGovernanceStandard(
  id: string,
): AgentGovernanceStandard | undefined {
  const standard = standards.get(id.trim());
  return standard ? cloneStandard(standard) : undefined;
}

export function listAgentGovernanceStandards(filter?: {
  kind?: AgentGovernanceStandardKind;
  status?: AgentGovernanceStandardStatus;
}): AgentGovernanceStandard[] {
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

export function clearAgentGovernanceStandards(): void {
  standards.clear();
  keys.clear();
}
