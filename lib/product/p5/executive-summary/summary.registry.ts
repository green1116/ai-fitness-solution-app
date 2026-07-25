/**
 * Product P5 — Executive summary registry
 */

import { getProposal } from "../proposal/proposal.registry";
import type {
  CreateExecutiveSummaryInput,
  ExecutiveSummary,
} from "./summary.types";

const summaries = new Map<string, ExecutiveSummary>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSummary(summary: ExecutiveSummary): ExecutiveSummary {
  return {
    ...summary,
    keyPoints: [...summary.keyPoints],
    metadata: { ...summary.metadata },
  };
}

export function createExecutiveSummary(
  input: CreateExecutiveSummaryInput,
): ExecutiveSummary {
  const proposalId = input.proposalId.trim();
  const headline = input.headline.trim();
  const narrative = input.narrative.trim();
  if (!proposalId) throw new Error("summary.proposalId is required");
  if (!headline) throw new Error("summary.headline is required");
  if (!narrative) throw new Error("summary.narrative is required");
  if (!getProposal(proposalId)) {
    throw new Error(`proposal not found: ${proposalId}`);
  }

  const id = input.id?.trim() || createId("p5sum");
  if (summaries.has(id)) {
    throw new Error(`executive summary already exists: ${id}`);
  }

  const keyPoints = (input.keyPoints ?? [])
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const summary: ExecutiveSummary = {
    id,
    proposalId,
    headline,
    narrative,
    keyPoints,
    detail: `headline=${headline} points=${keyPoints.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  summaries.set(id, summary);
  return cloneSummary(summary);
}

export function getExecutiveSummary(id: string): ExecutiveSummary | undefined {
  const summary = summaries.get(id.trim());
  return summary ? cloneSummary(summary) : undefined;
}

export function listExecutiveSummaries(filter?: {
  proposalId?: string;
}): ExecutiveSummary[] {
  let result = [...summaries.values()];
  if (filter?.proposalId) {
    const pid = filter.proposalId.trim();
    result = result.filter((s) => s.proposalId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSummary);
}

export function clearExecutiveSummaries(): void {
  summaries.clear();
}
