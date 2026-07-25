/**
 * Product P5 — Proposal registry
 */

import { PROPOSAL_STATUSES } from "./proposal.constants";
import type {
  AiProposal,
  CreateProposalInput,
  ProposalStatus,
  UpdateProposalStatusInput,
} from "./proposal.types";

const proposals = new Map<string, AiProposal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProposal(proposal: AiProposal): AiProposal {
  return { ...proposal, metadata: { ...proposal.metadata } };
}

export function createProposal(input: CreateProposalInput): AiProposal {
  const projectRef = input.projectRef.trim();
  const title = input.title.trim();
  const owner = input.owner.trim();
  if (!projectRef) throw new Error("proposal.projectRef is required");
  if (!title) throw new Error("proposal.title is required");
  if (!owner) throw new Error("proposal.owner is required");

  const id = input.id?.trim() || createId("p5prp");
  if (proposals.has(id)) {
    throw new Error(`proposal already exists: ${id}`);
  }

  const now = nowIso();
  const status = PROPOSAL_STATUSES[0];
  const templateId = input.templateId?.trim();
  const proposal: AiProposal = {
    id,
    projectRef,
    title,
    templateId,
    status,
    owner,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  proposals.set(id, proposal);
  return cloneProposal(proposal);
}

export function bindProposalTemplate(
  proposalId: string,
  templateId: string,
): AiProposal {
  const existing = proposals.get(proposalId.trim());
  if (!existing) throw new Error(`proposal not found: ${proposalId}`);
  const tid = templateId.trim();
  if (!tid) throw new Error("proposal.templateId is required");

  const updated: AiProposal = {
    ...existing,
    templateId: tid,
    detail: `status=${existing.status} template=${tid}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  proposals.set(proposalId.trim(), updated);
  return cloneProposal(updated);
}

export function updateProposalStatus(
  input: UpdateProposalStatusInput,
): AiProposal {
  const proposalId = input.proposalId.trim();
  if (!proposalId) throw new Error("proposal.proposalId is required");
  if (!(PROPOSAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid proposal status: ${input.status}`);
  }
  const existing = proposals.get(proposalId);
  if (!existing) throw new Error(`proposal not found: ${proposalId}`);

  const updated: AiProposal = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  proposals.set(proposalId, updated);
  return cloneProposal(updated);
}

export function getProposal(id: string): AiProposal | undefined {
  const proposal = proposals.get(id.trim());
  return proposal ? cloneProposal(proposal) : undefined;
}

export function listProposals(filter?: {
  projectRef?: string;
  status?: ProposalStatus;
}): AiProposal[] {
  let result = [...proposals.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((p) => p.projectRef === pref);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProposal);
}

export function clearProposals(): void {
  proposals.clear();
}
