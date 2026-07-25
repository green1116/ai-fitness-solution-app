/**
 * Product P3 — Project brief registry
 */

import { BRIEF_STATUSES } from "../project/project.constants";
import { getProject } from "../project/project.registry";
import type {
  BriefStatus,
  CreateProjectBriefInput,
  ProjectBrief,
  UpdateBriefStatusInput,
} from "./brief.types";

const briefs = new Map<string, ProjectBrief>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBrief(brief: ProjectBrief): ProjectBrief {
  return { ...brief, metadata: { ...brief.metadata } };
}

export function createProjectBrief(
  input: CreateProjectBriefInput,
): ProjectBrief {
  const projectId = input.projectId.trim();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!projectId) throw new Error("brief.projectId is required");
  if (!title) throw new Error("brief.title is required");
  if (!summary) throw new Error("brief.summary is required");
  if (!getProject(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }

  const id = input.id?.trim() || createId("p3brf");
  if (briefs.has(id)) {
    throw new Error(`project brief already exists: ${id}`);
  }

  const now = nowIso();
  const status = BRIEF_STATUSES[0];
  const brief: ProjectBrief = {
    id,
    projectId,
    title,
    summary,
    status,
    detail: `status=${status} title=${title}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  briefs.set(id, brief);
  return cloneBrief(brief);
}

export function updateBriefStatus(
  input: UpdateBriefStatusInput,
): ProjectBrief {
  const briefId = input.briefId.trim();
  if (!briefId) throw new Error("brief.briefId is required");
  if (!(BRIEF_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid brief status: ${input.status}`);
  }
  const existing = briefs.get(briefId);
  if (!existing) throw new Error(`project brief not found: ${briefId}`);

  const updated: ProjectBrief = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} title=${existing.title}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  briefs.set(briefId, updated);
  return cloneBrief(updated);
}

export function getProjectBrief(id: string): ProjectBrief | undefined {
  const brief = briefs.get(id.trim());
  return brief ? cloneBrief(brief) : undefined;
}

export function listProjectBriefs(filter?: {
  projectId?: string;
  status?: BriefStatus;
}): ProjectBrief[] {
  let result = [...briefs.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((b) => b.projectId === pid);
  }
  if (filter?.status) result = result.filter((b) => b.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBrief);
}

export function clearProjectBriefs(): void {
  briefs.clear();
}
