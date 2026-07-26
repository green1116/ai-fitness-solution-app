/**
 * Product M10 — AI Job definition registry (definition only)
 */

import { AI_JOB_KINDS, AI_JOB_STATUSES } from "./job.constants";
import type {
  AiJobDefinition,
  AiJobKind,
  AiJobStatus,
  RegisterAiJobInput,
  UpdateAiJobStatusInput,
} from "./job.types";

const jobs = new Map<string, AiJobDefinition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneJob(job: AiJobDefinition): AiJobDefinition {
  return { ...job, metadata: { ...job.metadata } };
}

export function registerAiJob(input: RegisterAiJobInput): AiJobDefinition {
  const jobKey = input.jobKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!jobKey) throw new Error("job.jobKey is required");
  if (!title) throw new Error("job.title is required");
  if (!summary) throw new Error("job.summary is required");
  if (!(AI_JOB_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid job kind: ${input.kind}`);
  }
  if (keys.has(jobKey)) {
    throw new Error(`jobKey already exists: ${jobKey}`);
  }

  const id = input.id?.trim() || createId("aijob");
  if (jobs.has(id)) throw new Error(`job already exists: ${id}`);

  const now = nowIso();
  const job: AiJobDefinition = {
    id,
    jobKey,
    kind: input.kind,
    status: AI_JOB_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(id, job);
  keys.set(jobKey, id);
  return cloneJob(job);
}

export function updateAiJobStatus(
  input: UpdateAiJobStatusInput,
): AiJobDefinition {
  const jobId = input.jobId.trim();
  if (!jobId) throw new Error("job.jobId is required");
  if (!(AI_JOB_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid job status: ${input.status}`);
  }

  const existing = jobs.get(jobId);
  if (!existing) throw new Error(`job not found: ${jobId}`);

  const updated: AiJobDefinition = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  jobs.set(jobId, updated);
  return cloneJob(updated);
}

export function getAiJob(id: string): AiJobDefinition | undefined {
  const job = jobs.get(id.trim());
  return job ? cloneJob(job) : undefined;
}

export function listAiJobs(filter?: {
  kind?: AiJobKind;
  status?: AiJobStatus;
}): AiJobDefinition[] {
  let result = [...jobs.values()];
  if (filter?.kind) result = result.filter((j) => j.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((j) => j.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.jobKey.localeCompare(b.jobKey))
    .map(cloneJob);
}

export function clearAiJobs(): void {
  jobs.clear();
  keys.clear();
}
