/**
 * Product Iteration — Backlog registry
 */

import { BACKLOG_PRIORITIES } from "../cycle/cycle.constants";
import { getCycle } from "../cycle/cycle.registry";
import type {
  BacklogItem,
  BacklogPriority,
  CreateBacklogInput,
} from "./backlog.types";

const items = new Map<string, BacklogItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneItem(item: BacklogItem): BacklogItem {
  return { ...item, metadata: { ...item.metadata } };
}

export function createBacklogItem(input: CreateBacklogInput): BacklogItem {
  const cycleId = input.cycleId.trim();
  const title = input.title.trim();
  if (!cycleId) throw new Error("backlog.cycleId is required");
  if (!title) throw new Error("backlog.title is required");
  if (!(BACKLOG_PRIORITIES as readonly string[]).includes(input.priority)) {
    throw new Error(`invalid backlog priority: ${input.priority}`);
  }
  if (!getCycle(cycleId)) throw new Error(`cycle not found: ${cycleId}`);

  const id = input.id?.trim() || createId("iterbl");
  if (items.has(id)) throw new Error(`backlog item already exists: ${id}`);

  const item: BacklogItem = {
    id,
    cycleId,
    title,
    priority: input.priority,
    detail: `priority=${input.priority}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  items.set(id, item);
  return cloneItem(item);
}

export function getBacklogItem(id: string): BacklogItem | undefined {
  const item = items.get(id.trim());
  return item ? cloneItem(item) : undefined;
}

export function listBacklog(filter?: {
  cycleId?: string;
  priority?: BacklogPriority;
}): BacklogItem[] {
  let result = [...items.values()];
  if (filter?.cycleId) {
    const cid = filter.cycleId.trim();
    result = result.filter((i) => i.cycleId === cid);
  }
  if (filter?.priority) {
    result = result.filter((i) => i.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneItem);
}

export function clearBacklog(): void {
  items.clear();
}
