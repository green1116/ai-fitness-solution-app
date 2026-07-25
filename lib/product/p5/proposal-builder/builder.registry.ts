/**
 * Product P5 — Proposal builder registry
 */

import { BUILDER_STATUSES } from "../proposal/proposal.constants";
import { getProposal } from "../proposal/proposal.registry";
import type {
  CompleteProposalBuildInput,
  ProposalBuild,
  StartProposalBuildInput,
} from "./builder.types";

const builds = new Map<string, ProposalBuild>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBuild(build: ProposalBuild): ProposalBuild {
  return {
    ...build,
    sectionIds: [...build.sectionIds],
    metadata: { ...build.metadata },
  };
}

export function startProposalBuild(
  input: StartProposalBuildInput,
): ProposalBuild {
  const proposalId = input.proposalId.trim();
  if (!proposalId) throw new Error("builder.proposalId is required");
  if (!getProposal(proposalId)) {
    throw new Error(`proposal not found: ${proposalId}`);
  }

  const id = input.id?.trim() || createId("p5bld");
  if (builds.has(id)) {
    throw new Error(`proposal build already exists: ${id}`);
  }

  const status = BUILDER_STATUSES[1];
  const build: ProposalBuild = {
    id,
    proposalId,
    status,
    sectionIds: [],
    detail: `status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    startedAt: nowIso(),
  };
  builds.set(id, build);
  return cloneBuild(build);
}

export function completeProposalBuild(
  input: CompleteProposalBuildInput,
): ProposalBuild {
  const buildId = input.buildId.trim();
  if (!buildId) throw new Error("builder.buildId is required");
  const existing = builds.get(buildId);
  if (!existing) throw new Error(`proposal build not found: ${buildId}`);
  if (existing.status === "COMPLETE") {
    throw new Error(`proposal build already complete: ${buildId}`);
  }

  const sectionIds = input.sectionIds
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (sectionIds.length < 1) {
    throw new Error("builder.sectionIds must include at least one section");
  }

  const updated: ProposalBuild = {
    ...existing,
    status: "COMPLETE",
    sectionIds,
    detail: `status=COMPLETE sections=${sectionIds.length}`,
    metadata: { ...existing.metadata },
    completedAt: nowIso(),
  };
  builds.set(buildId, updated);
  return cloneBuild(updated);
}

export function getProposalBuild(id: string): ProposalBuild | undefined {
  const build = builds.get(id.trim());
  return build ? cloneBuild(build) : undefined;
}

export function listProposalBuilds(filter?: {
  proposalId?: string;
}): ProposalBuild[] {
  let result = [...builds.values()];
  if (filter?.proposalId) {
    const pid = filter.proposalId.trim();
    result = result.filter((b) => b.proposalId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBuild);
}

export function clearProposalBuilds(): void {
  builds.clear();
}
