/**
 * Product M15 — Evolution experience in-memory registry
 */

import {
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
} from "./experience.constants";
import { validateEvolutionExperienceInput } from "./experience.metadata";
import type {
  EvolutionExperience,
  EvolutionExperienceKind,
  EvolutionExperienceStatus,
  RegisterEvolutionExperienceInput,
  UpdateEvolutionExperienceStatusInput,
} from "./experience.types";

const experiences = new Map<string, EvolutionExperience>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExperience(
  experience: EvolutionExperience,
): EvolutionExperience {
  return { ...experience, metadata: { ...experience.metadata } };
}

export function registerEvolutionExperience(
  input: RegisterEvolutionExperienceInput,
): EvolutionExperience {
  const validation = validateEvolutionExperienceInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution experience: ${first?.field} ${first?.message}`,
    );
  }

  const experienceKey = input.experienceKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const feedbackRef = (
    input.feedbackRef ?? PRODUCT_EVOLUTION_EXPERIENCE_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(experienceKey)) {
    throw new Error(`experienceKey already exists: ${experienceKey}`);
  }

  const id = input.id?.trim() || createId("evoex");
  if (experiences.has(id)) {
    throw new Error(`experience already exists: ${id}`);
  }

  const now = nowIso();
  const experience: EvolutionExperience = {
    id,
    experienceKey,
    kind: input.kind,
    status: EVOLUTION_EXPERIENCE_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    feedbackRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  experiences.set(id, experience);
  keys.set(experienceKey, id);
  return cloneExperience(experience);
}

export function updateEvolutionExperienceStatus(
  input: UpdateEvolutionExperienceStatusInput,
): EvolutionExperience {
  const experienceId = input.experienceId.trim();
  if (!experienceId) throw new Error("experience.experienceId is required");
  if (
    !(EVOLUTION_EXPERIENCE_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid experience status: ${input.status}`);
  }

  const existing = experiences.get(experienceId);
  if (!existing) throw new Error(`experience not found: ${experienceId}`);

  const updated: EvolutionExperience = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  experiences.set(experienceId, updated);
  return cloneExperience(updated);
}

export function getEvolutionExperience(
  id: string,
): EvolutionExperience | undefined {
  const experience = experiences.get(id.trim());
  return experience ? cloneExperience(experience) : undefined;
}

export function getEvolutionExperienceByKey(
  experienceKey: string,
): EvolutionExperience | undefined {
  const id = keys.get(experienceKey.trim().toUpperCase());
  return id ? getEvolutionExperience(id) : undefined;
}

export function listEvolutionExperiences(filter?: {
  kind?: EvolutionExperienceKind;
  status?: EvolutionExperienceStatus;
}): EvolutionExperience[] {
  let result = [...experiences.values()];
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.experienceKey.localeCompare(b.experienceKey))
    .map(cloneExperience);
}

export function clearEvolutionExperiences(): void {
  experiences.clear();
  keys.clear();
}
