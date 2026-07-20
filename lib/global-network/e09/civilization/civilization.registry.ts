/**
 * E09-P7 — Civilization Registry
 * Registers civilizations composing e09 layer bindings
 */

import { getAgent } from "../agent/agent.registry";
import { getEconomicNode } from "../economy/economy.registry";
import { getFederation } from "../federation/federation.registry";
import { getMarket } from "../market/market.registry";
import { getRegion } from "../regional/regional.registry";
import {
  E09_CIVILIZATION_BASE,
  E09_CIVILIZATION_FREEZE_VERSION,
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
  CIVILIZATION_STAGES,
  CIVILIZATION_STATUSES,
} from "./civilization.constants";
import type {
  Civilization,
  CivilizationRegistryManifest,
  CivilizationStage,
  CivilizationStatus,
  RegisterCivilizationInput,
} from "./civilization.types";

const civilizations = new Map<string, Civilization>();
const codeIndex = new Map<string, string>();

function cloneCivilization(entry: Civilization): Civilization {
  return {
    ...entry,
    regionIds: [...entry.regionIds],
    marketIds: [...entry.marketIds],
    federationIds: [...entry.federationIds],
    economicNodeIds: [...entry.economicNodeIds],
    agentIds: [...entry.agentIds],
    metadata: { ...entry.metadata },
  };
}

function assertStage(stage: string): asserts stage is CivilizationStage {
  if (!(CIVILIZATION_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid civilization stage: ${stage}`);
  }
}

function assertStatus(status: string): asserts status is CivilizationStatus {
  if (!(CIVILIZATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid civilization status: ${status}`);
  }
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("score must be a finite number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function uniqueIds(ids: string[] | undefined, label: string): string[] {
  if (!ids) return [];
  const cleaned = ids.map((id) => id.trim()).filter(Boolean);
  const unique = [...new Set(cleaned)];
  if (unique.length !== cleaned.length) {
    throw new Error(`duplicate ${label} ids are not allowed`);
  }
  return unique;
}

function validateBindings(input: {
  regionIds: string[];
  marketIds: string[];
  federationIds: string[];
  economicNodeIds: string[];
  agentIds: string[];
}): void {
  for (const id of input.regionIds) {
    if (!getRegion(id)) throw new Error(`region not found: ${id}`);
  }
  for (const id of input.marketIds) {
    if (!getMarket(id)) throw new Error(`market not found: ${id}`);
  }
  for (const id of input.federationIds) {
    if (!getFederation(id)) throw new Error(`federation not found: ${id}`);
  }
  for (const id of input.economicNodeIds) {
    if (!getEconomicNode(id)) {
      throw new Error(`economic node not found: ${id}`);
    }
  }
  for (const id of input.agentIds) {
    if (!getAgent(id)) throw new Error(`agent not found: ${id}`);
  }
}

export function registerCivilization(
  input: RegisterCivilizationInput,
): Civilization {
  const id = input.id.trim();
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  if (!id) throw new Error("civilization.id is required");
  if (!name) throw new Error("civilization.name is required");
  if (!code) throw new Error("civilization.code is required");

  const stage = input.stage ?? "NASCENT";
  assertStage(stage);
  const status = input.status ?? "ACTIVE";
  assertStatus(status);

  if (civilizations.has(id)) {
    throw new Error(`civilization already registered: ${id}`);
  }
  if (codeIndex.has(code)) {
    throw new Error(`civilization code already registered: ${code}`);
  }

  const regionIds = uniqueIds(input.regionIds, "region");
  const marketIds = uniqueIds(input.marketIds, "market");
  const federationIds = uniqueIds(input.federationIds, "federation");
  const economicNodeIds = uniqueIds(input.economicNodeIds, "economicNode");
  const agentIds = uniqueIds(input.agentIds, "agent");

  validateBindings({
    regionIds,
    marketIds,
    federationIds,
    economicNodeIds,
    agentIds,
  });

  const entry: Civilization = {
    id,
    name,
    code,
    stage,
    status,
    regionIds,
    marketIds,
    federationIds,
    economicNodeIds,
    agentIds,
    score: clampScore(input.score ?? 0),
    metadata: { ...(input.metadata ?? {}) },
  };

  civilizations.set(id, entry);
  codeIndex.set(code, id);
  return cloneCivilization(entry);
}

export function getCivilization(
  idOrCode: string,
  options?: { by?: "id" | "code" },
): Civilization | undefined {
  const key = idOrCode.trim();
  const by = options?.by ?? "id";

  if (by === "code") {
    const id = codeIndex.get(key.toUpperCase());
    if (!id) return undefined;
    const entry = civilizations.get(id);
    return entry ? cloneCivilization(entry) : undefined;
  }

  const entry = civilizations.get(key);
  return entry ? cloneCivilization(entry) : undefined;
}

export function listCivilizations(filter?: {
  status?: CivilizationStatus;
  stage?: CivilizationStage;
}): Civilization[] {
  let result = [...civilizations.values()];
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  if (filter?.stage) {
    result = result.filter((c) => c.stage === filter.stage);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCivilization);
}

export function removeCivilization(id: string): boolean {
  const entry = civilizations.get(id.trim());
  if (!entry) return false;
  civilizations.delete(entry.id);
  codeIndex.delete(entry.code);
  return true;
}

/** Persist status/stage/score mutations (used by orchestrator). */
export function updateCivilization(
  id: string,
  patch: {
    status?: CivilizationStatus;
    stage?: CivilizationStage;
    score?: number;
  },
): Civilization {
  const entry = civilizations.get(id.trim());
  if (!entry) throw new Error(`civilization not found: ${id}`);

  if (patch.status !== undefined) {
    assertStatus(patch.status);
    entry.status = patch.status;
  }
  if (patch.stage !== undefined) {
    assertStage(patch.stage);
    entry.stage = patch.stage;
  }
  if (patch.score !== undefined) {
    entry.score = clampScore(patch.score);
  }

  civilizations.set(entry.id, entry);
  return cloneCivilization(entry);
}

export function buildCivilizationRegistryManifest(): CivilizationRegistryManifest {
  const list = listCivilizations();
  return {
    civilizationId: E09_CIVILIZATION_ID,
    version: E09_CIVILIZATION_VERSION,
    freezeVersion: E09_CIVILIZATION_FREEZE_VERSION,
    base: E09_CIVILIZATION_BASE,
    civilizationCount: list.length,
    civilizations: list,
  };
}

export function clearCivilizations(): void {
  civilizations.clear();
  codeIndex.clear();
}
