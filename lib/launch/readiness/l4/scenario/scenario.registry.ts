/**
 * Launch L4 — Scenario registry
 */

import { SCENARIO_KINDS } from "./scenario.constants";
import type {
  DeliveryScenario,
  RegisterScenarioInput,
  ScenarioKind,
} from "./scenario.types";

const scenarios = new Map<string, DeliveryScenario>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScenario(scenario: DeliveryScenario): DeliveryScenario {
  return { ...scenario, metadata: { ...scenario.metadata } };
}

export function registerScenario(
  input: RegisterScenarioInput,
): DeliveryScenario {
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!name) throw new Error("scenario.name is required");
  if (!owner) throw new Error("scenario.owner is required");
  if (!(SCENARIO_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid scenario kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("l4scn");
  if (scenarios.has(id)) {
    throw new Error(`scenario already exists: ${id}`);
  }

  const objective =
    (input.objective ?? "").trim() ||
    `Validate ${input.kind.toLowerCase()} delivery`;
  const now = nowIso();
  const scenario: DeliveryScenario = {
    id,
    name,
    kind: input.kind,
    owner,
    objective,
    detail: `kind=${input.kind} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  scenarios.set(id, scenario);
  return cloneScenario(scenario);
}

export function getScenario(id: string): DeliveryScenario | undefined {
  const scenario = scenarios.get(id.trim());
  return scenario ? cloneScenario(scenario) : undefined;
}

export function listScenarios(filter?: {
  kind?: ScenarioKind;
  owner?: string;
}): DeliveryScenario[] {
  let result = [...scenarios.values()];
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.owner) {
    const owner = filter.owner.trim();
    result = result.filter((s) => s.owner === owner);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScenario);
}

export function clearScenarios(): void {
  scenarios.clear();
}
