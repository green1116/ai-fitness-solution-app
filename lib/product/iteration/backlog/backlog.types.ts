/**
 * Product Iteration — Backlog types
 */

import type { BACKLOG_PRIORITIES } from "../cycle/cycle.constants";

export type BacklogPriority = (typeof BACKLOG_PRIORITIES)[number];
export type BacklogMetadata = Record<string, unknown>;

export type BacklogItem = {
  id: string;
  cycleId: string;
  title: string;
  priority: BacklogPriority;
  detail: string;
  metadata: BacklogMetadata;
  createdAt: string;
};

export type CreateBacklogInput = {
  id?: string;
  cycleId: string;
  title: string;
  priority: BacklogPriority;
  metadata?: BacklogMetadata;
};
