/**
 * Launch L2 — Project tracker
 */

import { PROJECT_LIFECYCLE_STAGES } from "../pilot/pilot.constants";
import { getPilot } from "../pilot/pilot.registry";
import type {
  CreatePilotProjectInput,
  PilotProject,
  ProjectLifecycleStage,
  TrackProjectProgressInput,
} from "./project.types";

const projects = new Map<string, PilotProject>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProject(project: PilotProject): PilotProject {
  return { ...project, metadata: { ...project.metadata } };
}

export function createPilotProject(
  input: CreatePilotProjectInput,
): PilotProject {
  const name = input.name.trim();
  const pilotId = input.pilotId.trim();
  if (!name) throw new Error("project.name is required");
  if (!pilotId) throw new Error("project.pilotId is required");
  if (!getPilot(pilotId)) {
    throw new Error(`pilot not found: ${pilotId}`);
  }

  const stage: ProjectLifecycleStage = input.stage ?? "KICKOFF";
  if (!(PROJECT_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid project stage: ${stage}`);
  }

  const id = input.id?.trim() || createId("l2prj");
  if (projects.has(id)) {
    throw new Error(`pilot project already exists: ${id}`);
  }

  const now = nowIso();
  const project: PilotProject = {
    id,
    pilotId,
    name,
    stage,
    progress: 0,
    detail: `stage=${stage} progress=0`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  projects.set(id, project);
  return cloneProject(project);
}

export function trackProjectProgress(
  input: TrackProjectProgressInput,
): PilotProject {
  const projectId = input.projectId.trim();
  if (!projectId) throw new Error("project.projectId is required");
  if (
    !Number.isFinite(input.progress) ||
    input.progress < 0 ||
    input.progress > 100
  ) {
    throw new Error("project.progress must be between 0 and 100");
  }

  const current = projects.get(projectId);
  if (!current) throw new Error(`pilot project not found: ${projectId}`);

  const progress = Math.round(input.progress);
  const note = (input.note ?? "").trim();
  const updated: PilotProject = {
    ...current,
    progress,
    detail: note
      ? `stage=${current.stage} progress=${progress} note=${note}`
      : `stage=${current.stage} progress=${progress}`,
    updatedAt: nowIso(),
  };
  projects.set(projectId, updated);
  return cloneProject(updated);
}

export function getPilotProject(id: string): PilotProject | undefined {
  const project = projects.get(id.trim());
  return project ? cloneProject(project) : undefined;
}

export function listPilotProjects(filter?: {
  pilotId?: string;
  stage?: ProjectLifecycleStage;
}): PilotProject[] {
  let result = [...projects.values()];
  if (filter?.pilotId) {
    const pid = filter.pilotId.trim();
    result = result.filter((p) => p.pilotId === pid);
  }
  if (filter?.stage) result = result.filter((p) => p.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProject);
}

export function setPilotProject(project: PilotProject): void {
  projects.set(project.id, project);
}

export function clearPilotProjects(): void {
  projects.clear();
}
