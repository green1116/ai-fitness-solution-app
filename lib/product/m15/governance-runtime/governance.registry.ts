/**
 * Product M15 — Evolution governance in-memory registry
 */

import {
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
} from "./governance.constants";
import { validateEvolutionGovernanceInput } from "./governance.metadata";
import type {
  EvolutionGovernance,
  EvolutionGovernanceKind,
  EvolutionGovernanceStatus,
  RegisterEvolutionGovernanceInput,
  UpdateEvolutionGovernanceStatusInput,
} from "./governance.types";

const governances = new Map<string, EvolutionGovernance>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGovernance(
  governance: EvolutionGovernance,
): EvolutionGovernance {
  return { ...governance, metadata: { ...governance.metadata } };
}

export function registerEvolutionGovernance(
  input: RegisterEvolutionGovernanceInput,
): EvolutionGovernance {
  const validation = validateEvolutionGovernanceInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution governance: ${first?.field} ${first?.message}`,
    );
  }

  const governanceKey = input.governanceKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const capabilityRef = (
    input.capabilityRef ?? PRODUCT_EVOLUTION_GOVERNANCE_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(governanceKey)) {
    throw new Error(`governanceKey already exists: ${governanceKey}`);
  }

  const id = input.id?.trim() || createId("evogov");
  if (governances.has(id)) {
    throw new Error(`governance already exists: ${id}`);
  }

  const now = nowIso();
  const governance: EvolutionGovernance = {
    id,
    governanceKey,
    kind: input.kind,
    status: EVOLUTION_GOVERNANCE_FRAME_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    capabilityRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  governances.set(id, governance);
  keys.set(governanceKey, id);
  return cloneGovernance(governance);
}

export function updateEvolutionGovernanceStatus(
  input: UpdateEvolutionGovernanceStatusInput,
): EvolutionGovernance {
  const governanceId = input.governanceId.trim();
  if (!governanceId) throw new Error("governance.governanceId is required");
  if (
    !(EVOLUTION_GOVERNANCE_FRAME_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid governance status: ${input.status}`);
  }

  const existing = governances.get(governanceId);
  if (!existing) throw new Error(`governance not found: ${governanceId}`);

  const updated: EvolutionGovernance = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  governances.set(governanceId, updated);
  return cloneGovernance(updated);
}

export function getEvolutionGovernance(
  id: string,
): EvolutionGovernance | undefined {
  const governance = governances.get(id.trim());
  return governance ? cloneGovernance(governance) : undefined;
}

export function getEvolutionGovernanceByKey(
  governanceKey: string,
): EvolutionGovernance | undefined {
  const id = keys.get(governanceKey.trim().toUpperCase());
  return id ? getEvolutionGovernance(id) : undefined;
}

export function listEvolutionGovernances(filter?: {
  kind?: EvolutionGovernanceKind;
  status?: EvolutionGovernanceStatus;
}): EvolutionGovernance[] {
  let result = [...governances.values()];
  if (filter?.kind) result = result.filter((g) => g.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((g) => g.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.governanceKey.localeCompare(b.governanceKey))
    .map(cloneGovernance);
}

export function clearEvolutionGovernances(): void {
  governances.clear();
  keys.clear();
}
