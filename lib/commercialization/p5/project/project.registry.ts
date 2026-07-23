/**
 * Commercialization P5 — Project registry
 */

import { PROJECT_STATUSES } from "../delivery/delivery.constants";
import type {
  DeliveryProject,
  ProjectStatus,
  RegisterProjectInput,
} from "./project.types";

const projects = new Map<string, DeliveryProject>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProject(project: DeliveryProject): DeliveryProject {
  return { ...project, metadata: { ...project.metadata } };
}

export function registerProject(
  input: RegisterProjectInput,
): DeliveryProject {
  const name = input.name.trim();
  const accountRef = input.accountRef.trim();
  const workspaceRef = input.workspaceRef.trim();
  if (!name) throw new Error("project.name is required");
  if (!accountRef) throw new Error("project.accountRef is required");
  if (!workspaceRef) throw new Error("project.workspaceRef is required");

  const status: ProjectStatus = input.status ?? "PLANNED";
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid project status: ${status}`);
  }

  const id = input.id?.trim() || createId("proj");
  if (projects.has(id)) {
    throw new Error(`project already exists: ${id}`);
  }

  const now = nowIso();
  const project: DeliveryProject = {
    id,
    name,
    accountRef,
    workspaceRef,
    owner: (input.owner ?? "unassigned").trim() || "unassigned",
    status,
    detail: `status=${status} account=${accountRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  projects.set(id, project);
  return cloneProject(project);
}

export function setProjectStatus(
  id: string,
  status: ProjectStatus,
): DeliveryProject {
  const project = projects.get(id.trim());
  if (!project) throw new Error(`project not found: ${id}`);
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid project status: ${status}`);
  }
  project.status = status;
  project.updatedAt = nowIso();
  project.detail = `status=${status} account=${project.accountRef}`;
  projects.set(project.id, project);
  return cloneProject(project);
}

export function getDeliveryProject(id: string): DeliveryProject | undefined {
  const project = projects.get(id.trim());
  return project ? cloneProject(project) : undefined;
}

export function listDeliveryProjects(filter?: {
  status?: ProjectStatus;
  accountRef?: string;
}): DeliveryProject[] {
  let result = [...projects.values()];
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProject);
}

export function clearDeliveryProjects(): void {
  projects.clear();
}
