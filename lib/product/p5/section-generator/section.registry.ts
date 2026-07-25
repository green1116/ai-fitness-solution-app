/**
 * Product P5 — Section generator registry
 */

import {
  GENERATOR_STATUSES,
  PROPOSAL_SECTION_KINDS,
} from "../proposal/proposal.constants";
import { getProposal } from "../proposal/proposal.registry";
import type {
  GenerateSectionInput,
  ProposalSection,
  ProposalSectionKind,
} from "./section.types";

const sections = new Map<string, ProposalSection>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSection(section: ProposalSection): ProposalSection {
  return { ...section, metadata: { ...section.metadata } };
}

export function generateSection(
  input: GenerateSectionInput,
): ProposalSection {
  const proposalId = input.proposalId.trim();
  const title = input.title.trim();
  const body = input.body.trim();
  if (!proposalId) throw new Error("section.proposalId is required");
  if (!title) throw new Error("section.title is required");
  if (!body) throw new Error("section.body is required");
  if (!(PROPOSAL_SECTION_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid proposal section kind: ${input.kind}`);
  }
  if (!getProposal(proposalId)) {
    throw new Error(`proposal not found: ${proposalId}`);
  }

  const id = input.id?.trim() || createId("p5sec");
  if (sections.has(id)) {
    throw new Error(`proposal section already exists: ${id}`);
  }

  const status = GENERATOR_STATUSES[1];
  const section: ProposalSection = {
    id,
    proposalId,
    kind: input.kind,
    title,
    body,
    status,
    detail: `kind=${input.kind} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    generatedAt: nowIso(),
  };
  sections.set(id, section);
  return cloneSection(section);
}

export function getProposalSection(id: string): ProposalSection | undefined {
  const section = sections.get(id.trim());
  return section ? cloneSection(section) : undefined;
}

export function listProposalSections(filter?: {
  proposalId?: string;
  kind?: ProposalSectionKind;
}): ProposalSection[] {
  let result = [...sections.values()];
  if (filter?.proposalId) {
    const pid = filter.proposalId.trim();
    result = result.filter((s) => s.proposalId === pid);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSection);
}

export function clearProposalSections(): void {
  sections.clear();
}
