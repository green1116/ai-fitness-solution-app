/**
 * Product P5 — Solution overview registry
 */

import { getProposal } from "../proposal/proposal.registry";
import type {
  CreateSolutionOverviewInput,
  SolutionOverview,
} from "./overview.types";

const overviews = new Map<string, SolutionOverview>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOverview(overview: SolutionOverview): SolutionOverview {
  return {
    ...overview,
    capabilities: [...overview.capabilities],
    outcomes: [...overview.outcomes],
    metadata: { ...overview.metadata },
  };
}

export function createSolutionOverview(
  input: CreateSolutionOverviewInput,
): SolutionOverview {
  const proposalId = input.proposalId.trim();
  const approach = input.approach.trim();
  if (!proposalId) throw new Error("overview.proposalId is required");
  if (!approach) throw new Error("overview.approach is required");
  if (!getProposal(proposalId)) {
    throw new Error(`proposal not found: ${proposalId}`);
  }

  const id = input.id?.trim() || createId("p5ovw");
  if (overviews.has(id)) {
    throw new Error(`solution overview already exists: ${id}`);
  }

  const capabilities = (input.capabilities ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const outcomes = (input.outcomes ?? [])
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  const overview: SolutionOverview = {
    id,
    proposalId,
    approach,
    capabilities,
    outcomes,
    detail: `capabilities=${capabilities.length} outcomes=${outcomes.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  overviews.set(id, overview);
  return cloneOverview(overview);
}

export function getSolutionOverview(id: string): SolutionOverview | undefined {
  const overview = overviews.get(id.trim());
  return overview ? cloneOverview(overview) : undefined;
}

export function listSolutionOverviews(filter?: {
  proposalId?: string;
}): SolutionOverview[] {
  let result = [...overviews.values()];
  if (filter?.proposalId) {
    const pid = filter.proposalId.trim();
    result = result.filter((o) => o.proposalId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOverview);
}

export function clearSolutionOverviews(): void {
  overviews.clear();
}
