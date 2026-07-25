/**
 * Product Analytics — Dataset registry
 */

import { DATASET_STATUSES } from "../foundation/foundation.constants";
import type {
  AnalyticsDataset,
  DatasetStatus,
  RegisterDatasetInput,
  UpdateDatasetStatusInput,
} from "./dataset.types";

const datasets = new Map<string, AnalyticsDataset>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDataset(dataset: AnalyticsDataset): AnalyticsDataset {
  return { ...dataset, metadata: { ...dataset.metadata } };
}

export function registerDataset(
  input: RegisterDatasetInput,
): AnalyticsDataset {
  const name = input.name.trim();
  const source = input.source.trim();
  if (!name) throw new Error("dataset.name is required");
  if (!source) throw new Error("dataset.source is required");

  const id = input.id?.trim() || createId("anlds");
  if (datasets.has(id)) throw new Error(`dataset already exists: ${id}`);

  const now = nowIso();
  const dataset: AnalyticsDataset = {
    id,
    name,
    source,
    status: DATASET_STATUSES[0],
    detail: `source=${source} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  datasets.set(id, dataset);
  return cloneDataset(dataset);
}

export function updateDatasetStatus(
  input: UpdateDatasetStatusInput,
): AnalyticsDataset {
  const datasetId = input.datasetId.trim();
  if (!datasetId) throw new Error("dataset.datasetId is required");
  if (!(DATASET_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid dataset status: ${input.status}`);
  }

  const existing = datasets.get(datasetId);
  if (!existing) throw new Error(`dataset not found: ${datasetId}`);

  const updated: AnalyticsDataset = {
    ...existing,
    status: input.status,
    detail: `source=${existing.source} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  datasets.set(datasetId, updated);
  return cloneDataset(updated);
}

export function getDataset(id: string): AnalyticsDataset | undefined {
  const dataset = datasets.get(id.trim());
  return dataset ? cloneDataset(dataset) : undefined;
}

export function listDatasets(filter?: {
  status?: DatasetStatus;
}): AnalyticsDataset[] {
  let result = [...datasets.values()];
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDataset);
}

export function clearDatasets(): void {
  datasets.clear();
}
