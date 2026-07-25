/**
 * Product P3 — Requirement registry
 */

import { REQUIREMENT_PRIORITIES } from "../project/project.constants";
import { getProject } from "../project/project.registry";
import type {
  CaptureRequirementInput,
  ProjectRequirement,
  RequirementPriority,
} from "./requirement.types";

const requirements = new Map<string, ProjectRequirement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRequirement(
  requirement: ProjectRequirement,
): ProjectRequirement {
  return { ...requirement, metadata: { ...requirement.metadata } };
}

export function captureRequirement(
  input: CaptureRequirementInput,
): ProjectRequirement {
  const projectId = input.projectId.trim();
  const title = input.title.trim();
  const description = input.description.trim();
  if (!projectId) throw new Error("requirement.projectId is required");
  if (!title) throw new Error("requirement.title is required");
  if (!description) throw new Error("requirement.description is required");
  if (
    !(REQUIREMENT_PRIORITIES as readonly string[]).includes(input.priority)
  ) {
    throw new Error(`invalid requirement priority: ${input.priority}`);
  }
  if (!getProject(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }

  const id = input.id?.trim() || createId("p3req");
  if (requirements.has(id)) {
    throw new Error(`requirement already exists: ${id}`);
  }

  const requirement: ProjectRequirement = {
    id,
    projectId,
    title,
    priority: input.priority,
    description,
    detail: `priority=${input.priority} title=${title}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  requirements.set(id, requirement);
  return cloneRequirement(requirement);
}

export function getRequirement(id: string): ProjectRequirement | undefined {
  const requirement = requirements.get(id.trim());
  return requirement ? cloneRequirement(requirement) : undefined;
}

export function listRequirements(filter?: {
  projectId?: string;
  priority?: RequirementPriority;
}): ProjectRequirement[] {
  let result = [...requirements.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((r) => r.projectId === pid);
  }
  if (filter?.priority) {
    result = result.filter((r) => r.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRequirement);
}

export function clearRequirements(): void {
  requirements.clear();
}
