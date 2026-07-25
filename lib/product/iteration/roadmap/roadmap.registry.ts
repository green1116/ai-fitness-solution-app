/**
 * Product Iteration — Roadmap registry
 */

import { ROADMAP_HORIZONS } from "../cycle/cycle.constants";
import { getCycle } from "../cycle/cycle.registry";
import type {
  CreateRoadmapInput,
  RoadmapHorizon,
  RoadmapItem,
} from "./roadmap.types";

const items = new Map<string, RoadmapItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneItem(item: RoadmapItem): RoadmapItem {
  return { ...item, metadata: { ...item.metadata } };
}

export function createRoadmapItem(input: CreateRoadmapInput): RoadmapItem {
  const cycleId = input.cycleId.trim();
  const title = input.title.trim();
  if (!cycleId) throw new Error("roadmap.cycleId is required");
  if (!title) throw new Error("roadmap.title is required");
  if (!(ROADMAP_HORIZONS as readonly string[]).includes(input.horizon)) {
    throw new Error(`invalid roadmap horizon: ${input.horizon}`);
  }
  if (!getCycle(cycleId)) throw new Error(`cycle not found: ${cycleId}`);

  const id = input.id?.trim() || createId("iterrm");
  if (items.has(id)) throw new Error(`roadmap item already exists: ${id}`);

  const item: RoadmapItem = {
    id,
    cycleId,
    title,
    horizon: input.horizon,
    detail: `horizon=${input.horizon}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  items.set(id, item);
  return cloneItem(item);
}

export function getRoadmapItem(id: string): RoadmapItem | undefined {
  const item = items.get(id.trim());
  return item ? cloneItem(item) : undefined;
}

export function listRoadmap(filter?: {
  cycleId?: string;
  horizon?: RoadmapHorizon;
}): RoadmapItem[] {
  let result = [...items.values()];
  if (filter?.cycleId) {
    const cid = filter.cycleId.trim();
    result = result.filter((i) => i.cycleId === cid);
  }
  if (filter?.horizon) {
    result = result.filter((i) => i.horizon === filter.horizon);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneItem);
}

export function clearRoadmap(): void {
  items.clear();
}
