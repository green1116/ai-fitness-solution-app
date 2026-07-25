/**
 * Product Report — Render registry
 */

import { getReportJob } from "../job/job.registry";
import type { RenderReportInput, ReportRender } from "./render.types";

const renders = new Map<string, ReportRender>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRender(render: ReportRender): ReportRender {
  return { ...render, metadata: { ...render.metadata } };
}

export function renderReport(input: RenderReportInput): ReportRender {
  const jobId = input.jobId.trim();
  const artifactUri = input.artifactUri.trim();
  if (!jobId) throw new Error("render.jobId is required");
  if (!artifactUri) throw new Error("render.artifactUri is required");
  if (!Number.isFinite(input.byteSize) || input.byteSize < 0) {
    throw new Error("render.byteSize must be a non-negative number");
  }

  const job = getReportJob(jobId);
  if (!job) throw new Error(`report job not found: ${jobId}`);
  if (job.status !== "SUCCEEDED") {
    throw new Error(`report job not succeeded: ${jobId}`);
  }

  const duplicate = [...renders.values()].find((r) => r.jobId === jobId);
  if (duplicate) {
    throw new Error(`render already exists for job: ${jobId}`);
  }

  const id = input.id?.trim() || createId("rptrnd");
  if (renders.has(id)) throw new Error(`render already exists: ${id}`);

  const render: ReportRender = {
    id,
    jobId,
    artifactUri,
    byteSize: input.byteSize,
    detail: `uri=${artifactUri} bytes=${input.byteSize}`,
    metadata: { ...(input.metadata ?? {}) },
    renderedAt: nowIso(),
  };
  renders.set(id, render);
  return cloneRender(render);
}

export function getRender(id: string): ReportRender | undefined {
  const render = renders.get(id.trim());
  return render ? cloneRender(render) : undefined;
}

export function listRenders(filter?: {
  jobId?: string;
}): ReportRender[] {
  let result = [...renders.values()];
  if (filter?.jobId) {
    const jobId = filter.jobId.trim();
    result = result.filter((r) => r.jobId === jobId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRender);
}

export function clearRenders(): void {
  renders.clear();
}
