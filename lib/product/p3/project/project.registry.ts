/**
 * Product P3 — Project registry
 */

import { PROJECT_STATUSES } from "./project.constants";
import type {
  AiProject,
  CreateProjectInput,
  ProjectStatus,
  UpdateProjectStatusInput,
} from "./project.types";

const projects = new Map<string, AiProject>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProject(project: AiProject): AiProject {
  return { ...project, metadata: { ...project.metadata } };
}

export function createProject(input: CreateProjectInput): AiProject {
  const organizationRef = input.organizationRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!organizationRef) throw new Error("project.organizationRef is required");
  if (!name) throw new Error("project.name is required");
  if (!owner) throw new Error("project.owner is required");

  const id = input.id?.trim() || createId("p3prj");
  if (projects.has(id)) {
    throw new Error(`project already exists: ${id}`);
  }

  const now = nowIso();
  const status = PROJECT_STATUSES[0];
  const templateId = input.templateId?.trim();
  const project: AiProject = {
    id,
    organizationRef,
    name,
    templateId,
    status,
    owner,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  projects.set(id, project);
  return cloneProject(project);
}

export function bindProjectTemplate(
  projectId: string,
  templateId: string,
): AiProject {
  const existing = projects.get(projectId.trim());
  if (!existing) throw new Error(`project not found: ${projectId}`);
  const tid = templateId.trim();
  if (!tid) throw new Error("project.templateId is required");

  const updated: AiProject = {
    ...existing,
    templateId: tid,
    detail: `status=${existing.status} template=${tid}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  projects.set(projectId.trim(), updated);
  return cloneProject(updated);
}

export function updateProjectStatus(
  input: UpdateProjectStatusInput,
): AiProject {
  const projectId = input.projectId.trim();
  if (!projectId) throw new Error("project.projectId is required");
  if (!(PROJECT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid project status: ${input.status}`);
  }
  const existing = projects.get(projectId);
  if (!existing) throw new Error(`project not found: ${projectId}`);

  const updated: AiProject = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  projects.set(projectId, updated);
  return cloneProject(updated);
}

export function getProject(id: string): AiProject | undefined {
  const project = projects.get(id.trim());
  return project ? cloneProject(project) : undefined;
}

export function listProjects(filter?: {
  organizationRef?: string;
  status?: ProjectStatus;
}): AiProject[] {
  let result = [...projects.values()];
  if (filter?.organizationRef) {
    const oref = filter.organizationRef.trim();
    result = result.filter((p) => p.organizationRef === oref);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProject);
}

export function clearProjects(): void {
  projects.clear();
}
