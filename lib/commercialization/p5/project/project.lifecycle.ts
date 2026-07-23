/**
 * Commercialization P5 — Project lifecycle
 */

import { PROJECT_STATUSES } from "../delivery/delivery.constants";
import {
  getDeliveryProject,
  setProjectStatus,
} from "./project.registry";
import type {
  ProjectLifecycleRecord,
  ProjectStatus,
  TransitionProjectInput,
} from "./project.types";

const lifecycles = new Map<string, ProjectLifecycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(
  record: ProjectLifecycleRecord,
): ProjectLifecycleRecord {
  return { ...record };
}

export function transitionProject(
  input: TransitionProjectInput,
): ProjectLifecycleRecord {
  const projectId = input.projectId.trim();
  const project = getDeliveryProject(projectId);
  if (!project) throw new Error(`project not found: ${projectId}`);

  const status = input.status;
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid project status: ${status}`);
  }

  const previousStatus = project.status;
  setProjectStatus(projectId, status);

  const id = input.id?.trim() || createId("plife");
  if (lifecycles.has(id)) {
    throw new Error(`project lifecycle record already exists: ${id}`);
  }

  const record: ProjectLifecycleRecord = {
    id,
    projectId,
    status,
    previousStatus,
    reason:
      (input.reason ?? `transition ${previousStatus}→${status}`).trim(),
    transitionedAt: nowIso(),
  };
  lifecycles.set(id, record);
  return cloneRecord(record);
}

export function getProjectLifecycleRecord(
  id: string,
): ProjectLifecycleRecord | undefined {
  const record = lifecycles.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listProjectLifecycleRecords(filter?: {
  projectId?: string;
  status?: ProjectStatus;
}): ProjectLifecycleRecord[] {
  let result = [...lifecycles.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((r) => r.projectId === pid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearProjectLifecycleRecords(): void {
  lifecycles.clear();
}
