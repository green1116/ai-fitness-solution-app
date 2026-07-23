/**
 * Commercialization P7 — Governance registry
 */

import { GOVERNANCE_SCOPES } from "./governance.constants";
import type {
  GovernanceRecord,
  GovernanceScope,
  RegisterGovernanceInput,
} from "./governance.types";

const records = new Map<string, GovernanceRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: GovernanceRecord): GovernanceRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function registerGovernance(
  input: RegisterGovernanceInput,
): GovernanceRecord {
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!name) throw new Error("governance.name is required");
  if (!owner) throw new Error("governance.owner is required");
  if (!(GOVERNANCE_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid governance scope: ${input.scope}`);
  }

  const id = input.id?.trim() || createId("gov");
  if (records.has(id)) {
    throw new Error(`governance already exists: ${id}`);
  }

  const now = nowIso();
  const record: GovernanceRecord = {
    id,
    name,
    scope: input.scope,
    owner,
    detail: `scope=${input.scope} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  records.set(id, record);
  return cloneRecord(record);
}

export function getGovernance(id: string): GovernanceRecord | undefined {
  const record = records.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listGovernance(filter?: {
  scope?: GovernanceScope;
  owner?: string;
}): GovernanceRecord[] {
  let result = [...records.values()];
  if (filter?.scope) result = result.filter((r) => r.scope === filter.scope);
  if (filter?.owner) {
    const owner = filter.owner.trim();
    result = result.filter((r) => r.owner === owner);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearGovernance(): void {
  records.clear();
}
