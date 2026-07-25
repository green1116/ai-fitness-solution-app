/**
 * Product P5 — Proposal builder types
 */

import type { BUILDER_STATUSES } from "../proposal/proposal.constants";

export type BuilderStatus = (typeof BUILDER_STATUSES)[number];
export type BuilderMetadata = Record<string, unknown>;

export type ProposalBuild = {
  id: string;
  proposalId: string;
  status: BuilderStatus;
  sectionIds: string[];
  detail: string;
  metadata: BuilderMetadata;
  startedAt: string;
  completedAt?: string;
};

export type StartProposalBuildInput = {
  id?: string;
  proposalId: string;
  metadata?: BuilderMetadata;
};

export type CompleteProposalBuildInput = {
  buildId: string;
  sectionIds: string[];
};
