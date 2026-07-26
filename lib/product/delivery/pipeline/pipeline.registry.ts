/**
 * Product Delivery — Pipeline registry (declarative, no provider)
 */

import { DELIVERY_PIPELINE_STAGES } from "../management/management.constants";
import { getDeliveryRequest } from "../request/request.registry";
import type {
  DefineDeliveryPipelineInput,
  DeliveryPipeline,
  DeliveryPipelineStage,
} from "./pipeline.types";

const pipelines = new Map<string, DeliveryPipeline>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePipeline(pipeline: DeliveryPipeline): DeliveryPipeline {
  return {
    ...pipeline,
    stages: [...pipeline.stages],
    metadata: { ...pipeline.metadata },
  };
}

export function defineDeliveryPipeline(
  input: DefineDeliveryPipelineInput,
): DeliveryPipeline {
  const requestId = input.requestId.trim();
  if (!requestId) throw new Error("pipeline.requestId is required");
  if (!input.stages.length) throw new Error("pipeline.stages is required");
  if (!getDeliveryRequest(requestId)) {
    throw new Error(`request not found: ${requestId}`);
  }

  for (const stage of input.stages) {
    if (!(DELIVERY_PIPELINE_STAGES as readonly string[]).includes(stage)) {
      throw new Error(`invalid pipeline stage: ${stage}`);
    }
  }

  const stages = [...new Set(input.stages)] as DeliveryPipelineStage[];
  if (!stages.includes("ACCEPT") || !stages.includes("DISPATCH")) {
    throw new Error("pipeline must include ACCEPT and DISPATCH");
  }

  const duplicate = [...pipelines.values()].find(
    (p) => p.requestId === requestId,
  );
  if (duplicate) throw new Error(`pipeline already exists: ${requestId}`);

  const id = input.id?.trim() || createId("dlvpipe");
  if (pipelines.has(id)) throw new Error(`pipeline already exists: ${id}`);

  const pipeline: DeliveryPipeline = {
    id,
    requestId,
    stages,
    detail: `stages=${stages.join(",")}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  pipelines.set(id, pipeline);
  return clonePipeline(pipeline);
}

export function getDeliveryPipeline(id: string): DeliveryPipeline | undefined {
  const pipeline = pipelines.get(id.trim());
  return pipeline ? clonePipeline(pipeline) : undefined;
}

export function listDeliveryPipelines(filter?: {
  requestId?: string;
}): DeliveryPipeline[] {
  let result = [...pipelines.values()];
  if (filter?.requestId) {
    const requestId = filter.requestId.trim();
    result = result.filter((p) => p.requestId === requestId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePipeline);
}

export function clearDeliveryPipelines(): void {
  pipelines.clear();
}
