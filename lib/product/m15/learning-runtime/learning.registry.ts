/**
 * Product M15 — Evolution learning in-memory registry
 */

import {
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
} from "./learning.constants";
import { validateEvolutionLearningInput } from "./learning.metadata";
import type {
  EvolutionLearning,
  EvolutionLearningKind,
  EvolutionLearningStatus,
  RegisterEvolutionLearningInput,
  UpdateEvolutionLearningStatusInput,
} from "./learning.types";

const learnings = new Map<string, EvolutionLearning>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLearning(learning: EvolutionLearning): EvolutionLearning {
  return { ...learning, metadata: { ...learning.metadata } };
}

export function registerEvolutionLearning(
  input: RegisterEvolutionLearningInput,
): EvolutionLearning {
  const validation = validateEvolutionLearningInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution learning: ${first?.field} ${first?.message}`,
    );
  }

  const learningKey = input.learningKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const experienceRef = (
    input.experienceRef ?? PRODUCT_EVOLUTION_LEARNING_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(learningKey)) {
    throw new Error(`learningKey already exists: ${learningKey}`);
  }

  const id = input.id?.trim() || createId("evolrn");
  if (learnings.has(id)) throw new Error(`learning already exists: ${id}`);

  const now = nowIso();
  const learning: EvolutionLearning = {
    id,
    learningKey,
    kind: input.kind,
    status: EVOLUTION_LEARNING_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    experienceRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  learnings.set(id, learning);
  keys.set(learningKey, id);
  return cloneLearning(learning);
}

export function updateEvolutionLearningStatus(
  input: UpdateEvolutionLearningStatusInput,
): EvolutionLearning {
  const learningId = input.learningId.trim();
  if (!learningId) throw new Error("learning.learningId is required");
  if (
    !(EVOLUTION_LEARNING_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid learning status: ${input.status}`);
  }

  const existing = learnings.get(learningId);
  if (!existing) throw new Error(`learning not found: ${learningId}`);

  const updated: EvolutionLearning = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  learnings.set(learningId, updated);
  return cloneLearning(updated);
}

export function getEvolutionLearning(
  id: string,
): EvolutionLearning | undefined {
  const learning = learnings.get(id.trim());
  return learning ? cloneLearning(learning) : undefined;
}

export function getEvolutionLearningByKey(
  learningKey: string,
): EvolutionLearning | undefined {
  const id = keys.get(learningKey.trim().toUpperCase());
  return id ? getEvolutionLearning(id) : undefined;
}

export function listEvolutionLearnings(filter?: {
  kind?: EvolutionLearningKind;
  status?: EvolutionLearningStatus;
}): EvolutionLearning[] {
  let result = [...learnings.values()];
  if (filter?.kind) result = result.filter((l) => l.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((l) => l.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.learningKey.localeCompare(b.learningKey))
    .map(cloneLearning);
}

export function clearEvolutionLearnings(): void {
  learnings.clear();
  keys.clear();
}
