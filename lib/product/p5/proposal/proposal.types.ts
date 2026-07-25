/**
 * Product P5 — Proposal types + readiness / manifest
 */

import type {
  P5_MANAGER_STATUSES,
  P5_READINESS_VERDICTS,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
  PROPOSAL_STATUSES,
} from "./proposal.constants";

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];
export type P5ReadinessVerdict = (typeof P5_READINESS_VERDICTS)[number];
export type P5ManagerStatus = (typeof P5_MANAGER_STATUSES)[number];
export type ProposalMetadata = Record<string, unknown>;

export type AiProposal = {
  id: string;
  projectRef: string;
  title: string;
  templateId?: string;
  status: ProposalStatus;
  owner: string;
  detail: string;
  metadata: ProposalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProposalInput = {
  id?: string;
  projectRef: string;
  title: string;
  owner: string;
  templateId?: string;
  metadata?: ProposalMetadata;
};

export type UpdateProposalStatusInput = {
  proposalId: string;
  status: ProposalStatus;
};

export type P5ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P5ReadinessResult = {
  verdict: P5ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P5ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P5RegistryManifest = {
  foundationId: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_ID;
  version: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION;
  freezeVersion: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION;
  base: typeof PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE;
  proposalCount: number;
  templateCount: number;
  builderCount: number;
  sectionCount: number;
  executiveSummaryCount: number;
  solutionOverviewCount: number;
  differentiatorCount: number;
};
