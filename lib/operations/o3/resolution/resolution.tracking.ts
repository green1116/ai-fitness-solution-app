/**
 * Operations O3 — Resolution tracking
 */

import { getKnowledgeArticle } from "../knowledge/knowledge.article";
import { RESOLUTION_OUTCOMES } from "../ticket/ticket.constants";
import { getTicket } from "../ticket/ticket.registry";
import type {
  ResolutionOutcome,
  ResolutionTracking,
  TrackResolutionInput,
} from "./resolution.types";

const resolutions = new Map<string, ResolutionTracking>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneResolution(
  resolution: ResolutionTracking,
): ResolutionTracking {
  return { ...resolution, metadata: { ...resolution.metadata } };
}

export function trackResolution(
  input: TrackResolutionInput,
): ResolutionTracking {
  const ticketId = input.ticketId.trim();
  const summary = input.summary.trim();
  if (!ticketId) throw new Error("resolution.ticketId is required");
  if (!summary) throw new Error("resolution.summary is required");
  if (!(RESOLUTION_OUTCOMES as readonly string[]).includes(input.outcome)) {
    throw new Error(`invalid resolution outcome: ${input.outcome}`);
  }
  if (!getTicket(ticketId)) {
    throw new Error(`ticket not found: ${ticketId}`);
  }

  const articleId = input.articleId?.trim();
  if (articleId && !getKnowledgeArticle(articleId)) {
    throw new Error(`knowledge article not found: ${articleId}`);
  }

  const id = input.id?.trim() || createId("o3res");
  if (resolutions.has(id)) {
    throw new Error(`resolution already exists: ${id}`);
  }

  const resolution: ResolutionTracking = {
    id,
    ticketId,
    outcome: input.outcome,
    summary,
    articleId,
    detail: `outcome=${input.outcome} ticket=${ticketId}`,
    metadata: { ...(input.metadata ?? {}) },
    resolvedAt: nowIso(),
  };
  resolutions.set(id, resolution);
  return cloneResolution(resolution);
}

export function getResolution(
  id: string,
): ResolutionTracking | undefined {
  const resolution = resolutions.get(id.trim());
  return resolution ? cloneResolution(resolution) : undefined;
}

export function listResolutions(filter?: {
  ticketId?: string;
  outcome?: ResolutionOutcome;
}): ResolutionTracking[] {
  let result = [...resolutions.values()];
  if (filter?.ticketId) {
    const tid = filter.ticketId.trim();
    result = result.filter((r) => r.ticketId === tid);
  }
  if (filter?.outcome) {
    result = result.filter((r) => r.outcome === filter.outcome);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneResolution);
}

export function clearResolutions(): void {
  resolutions.clear();
}
