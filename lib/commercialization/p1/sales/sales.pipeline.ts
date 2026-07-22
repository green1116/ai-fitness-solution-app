/**
 * Commercialization P1 — Sales pipeline
 */

import { PIPELINE_STAGES } from "./sales.constants";
import {
  getOpportunity,
  updateOpportunityStage,
} from "./sales.registry";
import type {
  AdvancePipelineInput,
  PipelineEntry,
  PipelineStage,
} from "./sales.types";

const pipeline = new Map<string, PipelineEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: PipelineEntry): PipelineEntry {
  return { ...entry };
}

export function advancePipeline(
  input: AdvancePipelineInput,
): PipelineEntry {
  const opportunityId = input.opportunityId.trim();
  const opportunity = getOpportunity(opportunityId);
  if (!opportunity) {
    throw new Error(`opportunity not found: ${opportunityId}`);
  }

  const stage = input.stage;
  if (!(PIPELINE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid pipeline stage: ${stage}`);
  }

  const previousStage = opportunity.stage;
  updateOpportunityStage(opportunityId, stage);

  const id = input.id?.trim() || createId("pipe");
  if (pipeline.has(id)) {
    throw new Error(`pipeline entry already exists: ${id}`);
  }

  const entry: PipelineEntry = {
    id,
    opportunityId,
    stage,
    previousStage,
    note: (input.note ?? `moved ${previousStage}→${stage}`).trim(),
    movedAt: nowIso(),
  };
  pipeline.set(id, entry);
  return cloneEntry(entry);
}

export function getPipelineEntry(id: string): PipelineEntry | undefined {
  const entry = pipeline.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listPipelineEntries(filter?: {
  opportunityId?: string;
  stage?: PipelineStage;
}): PipelineEntry[] {
  let result = [...pipeline.values()];
  if (filter?.opportunityId) {
    const oid = filter.opportunityId.trim();
    result = result.filter((e) => e.opportunityId === oid);
  }
  if (filter?.stage) result = result.filter((e) => e.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearPipelineEntries(): void {
  pipeline.clear();
}
