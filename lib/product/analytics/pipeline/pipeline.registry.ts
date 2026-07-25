/**
 * Product Analytics — Pipeline registry
 */

import { getDataset } from "../dataset/dataset.registry";
import { PIPELINE_STATUSES } from "../foundation/foundation.constants";
import { getMetric } from "../metric/metric.registry";
import type {
  AnalyticsPipeline,
  CreatePipelineInput,
  PipelineStatus,
  RunPipelineInput,
} from "./pipeline.types";

const pipelines = new Map<string, AnalyticsPipeline>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePipeline(pipeline: AnalyticsPipeline): AnalyticsPipeline {
  return { ...pipeline, metadata: { ...pipeline.metadata } };
}

export function createPipeline(
  input: CreatePipelineInput,
): AnalyticsPipeline {
  const datasetId = input.datasetId.trim();
  const metricId = input.metricId.trim();
  if (!datasetId) throw new Error("pipeline.datasetId is required");
  if (!metricId) throw new Error("pipeline.metricId is required");
  if (!getDataset(datasetId)) {
    throw new Error(`dataset not found: ${datasetId}`);
  }
  if (!getMetric(metricId)) {
    throw new Error(`metric not found: ${metricId}`);
  }

  const id = input.id?.trim() || createId("anlpipe");
  if (pipelines.has(id)) throw new Error(`pipeline already exists: ${id}`);

  const now = nowIso();
  const pipeline: AnalyticsPipeline = {
    id,
    datasetId,
    metricId,
    status: PIPELINE_STATUSES[0],
    detail: `status=IDLE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  pipelines.set(id, pipeline);
  return clonePipeline(pipeline);
}

export function runPipeline(input: RunPipelineInput): AnalyticsPipeline {
  const pipelineId = input.pipelineId.trim();
  if (!pipelineId) throw new Error("pipeline.pipelineId is required");

  const existing = pipelines.get(pipelineId);
  if (!existing) throw new Error(`pipeline not found: ${pipelineId}`);
  if (existing.status === "RUNNING") {
    throw new Error(`pipeline already running: ${pipelineId}`);
  }

  const updated: AnalyticsPipeline = {
    ...existing,
    status: "SUCCEEDED",
    detail: `status=SUCCEEDED`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  pipelines.set(pipelineId, updated);
  return clonePipeline(updated);
}

export function getPipeline(id: string): AnalyticsPipeline | undefined {
  const pipeline = pipelines.get(id.trim());
  return pipeline ? clonePipeline(pipeline) : undefined;
}

export function listPipelines(filter?: {
  status?: PipelineStatus;
}): AnalyticsPipeline[] {
  let result = [...pipelines.values()];
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePipeline);
}

export function clearPipelines(): void {
  pipelines.clear();
}
