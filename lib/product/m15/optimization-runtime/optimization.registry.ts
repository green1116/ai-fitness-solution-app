/**
 * Product M15 — Evolution optimization proposal in-memory registry
 */

import {
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
} from "./optimization.constants";
import { validateEvolutionOptimizationProposalInput } from "./optimization.metadata";
import type {
  EvolutionOptimizationProposal,
  EvolutionOptimizationProposalKind,
  EvolutionOptimizationProposalStatus,
  RegisterEvolutionOptimizationProposalInput,
  UpdateEvolutionOptimizationProposalStatusInput,
} from "./optimization.types";

const proposals = new Map<string, EvolutionOptimizationProposal>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProposal(
  proposal: EvolutionOptimizationProposal,
): EvolutionOptimizationProposal {
  return { ...proposal, metadata: { ...proposal.metadata } };
}

export function registerEvolutionOptimizationProposal(
  input: RegisterEvolutionOptimizationProposalInput,
): EvolutionOptimizationProposal {
  const validation = validateEvolutionOptimizationProposalInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution optimization proposal: ${first?.field} ${first?.message}`,
    );
  }

  const proposalKey = input.proposalKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const learningRef = (
    input.learningRef ?? PRODUCT_EVOLUTION_OPTIMIZATION_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(proposalKey)) {
    throw new Error(`proposalKey already exists: ${proposalKey}`);
  }

  const id = input.id?.trim() || createId("evopt");
  if (proposals.has(id)) throw new Error(`proposal already exists: ${id}`);

  const now = nowIso();
  const proposal: EvolutionOptimizationProposal = {
    id,
    proposalKey,
    kind: input.kind,
    status: EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    learningRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  proposals.set(id, proposal);
  keys.set(proposalKey, id);
  return cloneProposal(proposal);
}

export function updateEvolutionOptimizationProposalStatus(
  input: UpdateEvolutionOptimizationProposalStatusInput,
): EvolutionOptimizationProposal {
  const proposalId = input.proposalId.trim();
  if (!proposalId) throw new Error("proposal.proposalId is required");
  if (
    !(EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid proposal status: ${input.status}`);
  }

  const existing = proposals.get(proposalId);
  if (!existing) throw new Error(`proposal not found: ${proposalId}`);

  const updated: EvolutionOptimizationProposal = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  proposals.set(proposalId, updated);
  return cloneProposal(updated);
}

export function getEvolutionOptimizationProposal(
  id: string,
): EvolutionOptimizationProposal | undefined {
  const proposal = proposals.get(id.trim());
  return proposal ? cloneProposal(proposal) : undefined;
}

export function getEvolutionOptimizationProposalByKey(
  proposalKey: string,
): EvolutionOptimizationProposal | undefined {
  const id = keys.get(proposalKey.trim().toUpperCase());
  return id ? getEvolutionOptimizationProposal(id) : undefined;
}

export function listEvolutionOptimizationProposals(filter?: {
  kind?: EvolutionOptimizationProposalKind;
  status?: EvolutionOptimizationProposalStatus;
}): EvolutionOptimizationProposal[] {
  let result = [...proposals.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.proposalKey.localeCompare(b.proposalKey))
    .map(cloneProposal);
}

export function clearEvolutionOptimizationProposals(): void {
  proposals.clear();
  keys.clear();
}
