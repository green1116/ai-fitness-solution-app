/**
 * Product P5 — Differentiator registry
 */

import { getProposal } from "../proposal/proposal.registry";
import type {
  CreateDifferentiatorInput,
  Differentiator,
} from "./differentiator.types";

const differentiators = new Map<string, Differentiator>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDifferentiator(
  differentiator: Differentiator,
): Differentiator {
  return {
    ...differentiator,
    evidence: [...differentiator.evidence],
    metadata: { ...differentiator.metadata },
  };
}

export function createDifferentiator(
  input: CreateDifferentiatorInput,
): Differentiator {
  const proposalId = input.proposalId.trim();
  const title = input.title.trim();
  const claim = input.claim.trim();
  if (!proposalId) throw new Error("differentiator.proposalId is required");
  if (!title) throw new Error("differentiator.title is required");
  if (!claim) throw new Error("differentiator.claim is required");
  if (!getProposal(proposalId)) {
    throw new Error(`proposal not found: ${proposalId}`);
  }

  const id = input.id?.trim() || createId("p5dif");
  if (differentiators.has(id)) {
    throw new Error(`differentiator already exists: ${id}`);
  }

  const evidence = (input.evidence ?? [])
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
  const differentiator: Differentiator = {
    id,
    proposalId,
    title,
    claim,
    evidence,
    detail: `title=${title} evidence=${evidence.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  differentiators.set(id, differentiator);
  return cloneDifferentiator(differentiator);
}

export function getDifferentiator(id: string): Differentiator | undefined {
  const differentiator = differentiators.get(id.trim());
  return differentiator ? cloneDifferentiator(differentiator) : undefined;
}

export function listDifferentiators(filter?: {
  proposalId?: string;
}): Differentiator[] {
  let result = [...differentiators.values()];
  if (filter?.proposalId) {
    const pid = filter.proposalId.trim();
    result = result.filter((d) => d.proposalId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDifferentiator);
}

export function clearDifferentiators(): void {
  differentiators.clear();
}
