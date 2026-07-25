/**
 * Product Iteration — Cadence registry
 */

import { CADENCE_KINDS } from "../cycle/cycle.constants";
import { getCycle } from "../cycle/cycle.registry";
import type {
  CadenceKind,
  CreateCadenceInput,
  IterationCadence,
} from "./cadence.types";

const cadences = new Map<string, IterationCadence>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCadence(cadence: IterationCadence): IterationCadence {
  return { ...cadence, metadata: { ...cadence.metadata } };
}

export function createCadence(input: CreateCadenceInput): IterationCadence {
  const cycleId = input.cycleId.trim();
  const name = input.name.trim();
  if (!cycleId) throw new Error("cadence.cycleId is required");
  if (!name) throw new Error("cadence.name is required");
  if (!(CADENCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid cadence kind: ${input.kind}`);
  }
  if (!getCycle(cycleId)) throw new Error(`cycle not found: ${cycleId}`);

  const id = input.id?.trim() || createId("itercad");
  if (cadences.has(id)) throw new Error(`cadence already exists: ${id}`);

  const cadence: IterationCadence = {
    id,
    cycleId,
    kind: input.kind,
    name,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  cadences.set(id, cadence);
  return cloneCadence(cadence);
}

export function getCadence(id: string): IterationCadence | undefined {
  const cadence = cadences.get(id.trim());
  return cadence ? cloneCadence(cadence) : undefined;
}

export function listCadences(filter?: {
  cycleId?: string;
  kind?: CadenceKind;
}): IterationCadence[] {
  let result = [...cadences.values()];
  if (filter?.cycleId) {
    const cid = filter.cycleId.trim();
    result = result.filter((c) => c.cycleId === cid);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCadence);
}

export function clearCadences(): void {
  cadences.clear();
}
