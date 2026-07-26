/**
 * Product M09 — AI Workflow version registry (declaration only)
 */

import { AI_WORKFLOW_VERSION_STATUSES } from "./workflow.constants";
import { getAiWorkflow } from "./workflow.registry";
import type {
  AiWorkflowVersion,
  AiWorkflowVersionStatus,
  RegisterAiWorkflowVersionInput,
  UpdateAiWorkflowVersionStatusInput,
} from "./workflow.types";

const versions = new Map<string, AiWorkflowVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: AiWorkflowVersion): AiWorkflowVersion {
  return { ...version, metadata: { ...version.metadata } };
}

export function registerAiWorkflowVersion(
  input: RegisterAiWorkflowVersionInput,
): AiWorkflowVersion {
  const workflowId = input.workflowId.trim();
  const versionKey = input.versionKey.trim().toUpperCase();
  const semver = input.semver.trim();
  if (!workflowId) throw new Error("version.workflowId is required");
  if (!versionKey) throw new Error("version.versionKey is required");
  if (!semver) throw new Error("version.semver is required");

  const workflow = getAiWorkflow(workflowId);
  if (!workflow) throw new Error(`workflow not found: ${workflowId}`);
  if (workflow.status === "RETIRED") {
    throw new Error(`workflow retired: ${workflowId}`);
  }

  const duplicate = [...versions.values()].find(
    (v) => v.workflowId === workflowId && v.versionKey === versionKey,
  );
  if (duplicate) {
    throw new Error(`versionKey already exists: ${versionKey}`);
  }

  const id = input.id?.trim() || createId("aiwfver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const now = nowIso();
  const version: AiWorkflowVersion = {
    id,
    workflowId,
    versionKey,
    semver,
    status: AI_WORKFLOW_VERSION_STATUSES[0],
    detail: `semver=${semver} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function updateAiWorkflowVersionStatus(
  input: UpdateAiWorkflowVersionStatusInput,
): AiWorkflowVersion {
  const versionId = input.versionId.trim();
  if (!versionId) throw new Error("version.versionId is required");
  if (
    !(AI_WORKFLOW_VERSION_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid version status: ${input.status}`);
  }

  const existing = versions.get(versionId);
  if (!existing) throw new Error(`version not found: ${versionId}`);

  const updated: AiWorkflowVersion = {
    ...existing,
    status: input.status,
    detail: `semver=${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  versions.set(versionId, updated);
  return cloneVersion(updated);
}

export function getAiWorkflowVersion(
  id: string,
): AiWorkflowVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listAiWorkflowVersions(filter?: {
  workflowId?: string;
  status?: AiWorkflowVersionStatus;
}): AiWorkflowVersion[] {
  let result = [...versions.values()];
  if (filter?.workflowId) {
    const workflowId = filter.workflowId.trim();
    result = result.filter((v) => v.workflowId === workflowId);
  }
  if (filter?.status) {
    result = result.filter((v) => v.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.versionKey.localeCompare(b.versionKey))
    .map(cloneVersion);
}

export function clearAiWorkflowVersions(): void {
  versions.clear();
}
