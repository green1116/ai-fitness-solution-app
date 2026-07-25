/**
 * Product Iteration — Experiment registry
 */

import { EXPERIMENT_STATUSES } from "../cycle/cycle.constants";
import { getCycle } from "../cycle/cycle.registry";
import type {
  ConcludeExperimentInput,
  CreateExperimentInput,
  ProductExperiment,
} from "./experiment.types";

const experiments = new Map<string, ProductExperiment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExperiment(
  experiment: ProductExperiment,
): ProductExperiment {
  return { ...experiment, metadata: { ...experiment.metadata } };
}

export function createExperiment(
  input: CreateExperimentInput,
): ProductExperiment {
  const cycleId = input.cycleId.trim();
  const hypothesis = input.hypothesis.trim();
  if (!cycleId) throw new Error("experiment.cycleId is required");
  if (!hypothesis) throw new Error("experiment.hypothesis is required");
  if (!getCycle(cycleId)) throw new Error(`cycle not found: ${cycleId}`);

  const id = input.id?.trim() || createId("iterexp");
  if (experiments.has(id)) {
    throw new Error(`experiment already exists: ${id}`);
  }

  const now = nowIso();
  const status = EXPERIMENT_STATUSES[1];
  const experiment: ProductExperiment = {
    id,
    cycleId,
    hypothesis,
    status,
    detail: `status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  experiments.set(id, experiment);
  return cloneExperiment(experiment);
}

export function concludeExperiment(
  input: ConcludeExperimentInput,
): ProductExperiment {
  const experimentId = input.experimentId.trim();
  if (!experimentId) throw new Error("experiment.experimentId is required");
  if (
    input.status !== "CONCLUDED" &&
    input.status !== "ABANDONED"
  ) {
    throw new Error(`invalid experiment conclusion: ${input.status}`);
  }
  const existing = experiments.get(experimentId);
  if (!existing) throw new Error(`experiment not found: ${experimentId}`);
  if (
    existing.status === "CONCLUDED" ||
    existing.status === "ABANDONED"
  ) {
    throw new Error(`experiment already concluded: ${experimentId}`);
  }

  const result = (input.result ?? "").trim();
  const updated: ProductExperiment = {
    ...existing,
    status: input.status,
    result: result || undefined,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  experiments.set(experimentId, updated);
  return cloneExperiment(updated);
}

export function getExperiment(id: string): ProductExperiment | undefined {
  const experiment = experiments.get(id.trim());
  return experiment ? cloneExperiment(experiment) : undefined;
}

export function listExperiments(filter?: {
  cycleId?: string;
}): ProductExperiment[] {
  let result = [...experiments.values()];
  if (filter?.cycleId) {
    const cid = filter.cycleId.trim();
    result = result.filter((e) => e.cycleId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExperiment);
}

export function clearExperiments(): void {
  experiments.clear();
}
