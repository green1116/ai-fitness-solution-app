/**
 * E01-P5 — AI Proposal Intelligence Engine types
 * BidStrategy + RequirementIndex → ProposalBlueprint lifecycle
 */

import type { RequirementIndex } from "../understanding/understanding.types";
import type {
  BidStrategy,
  ProposalEmphasis,
} from "../strategy/strategy.types";
import type { RiskSeverity } from "../intelligence/intelligence.types";

export const V101_PROPOSAL_INTELLIGENCE_VERSION = "v101-proposal-intelligence-1" as const;
export const V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION =
  "v101-proposal-intelligence-freeze-1" as const;

export type ProposalLifecycleStage = "strategy" | "blueprint";

export type ProposalBlueprintStatus = "pending" | "drafted" | "ready" | "failed";

export type ProposalChapterKind =
  | "executive_summary"
  | "understanding"
  | "technical_solution"
  | "equipment_plan"
  | "commercial_offer"
  | "delivery_plan"
  | "compliance_matrix"
  | "appendix";

export type RequirementCoverageStatus = "covered" | "partial" | "gap";

export type ProposalChapter = {
  id: string;
  kind: ProposalChapterKind;
  title: string;
  order: number;
  emphasis: ProposalEmphasis[];
  outline: string[];
  linkedRequirementIds: string[];
  ownerHint: string;
  readOnly: true;
};

export type RequirementCoverageItem = {
  id: string;
  requirementId: string;
  chapterId: string;
  status: RequirementCoverageStatus;
  responseHint: string;
  priorityWeight: number;
  readOnly: true;
};

export type ProposalEvidenceNeed = {
  id: string;
  label: string;
  severity: RiskSeverity;
  relatedChapterIds: string[];
  relatedRequirementIds: string[];
  readOnly: true;
};

export type ProposalBlueprint = {
  id: string;
  strategyId: string;
  requirementIndexId: string;
  opportunityId: string;
  workspaceId: string;
  status: ProposalBlueprintStatus;
  title: string;
  chapterCount: number;
  coverageCount: number;
  coveredMustCount: number;
  coverageRatio: number;
  chapters: ProposalChapter[];
  coverage: RequirementCoverageItem[];
  evidenceNeeds: ProposalEvidenceNeed[];
  narrativeArc: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type ProposalLifecycleTransition = {
  from: ProposalLifecycleStage;
  to: ProposalLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type ProposalLifecycle = {
  current: ProposalLifecycleStage;
  stages: ProposalLifecycleStage[];
  transitions: ProposalLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type ProposalKernelInput = {
  deploymentId?: string;
  strategy: BidStrategy;
  requirementIndex: RequirementIndex;
  titleHint?: string;
};

export type ProposalKernelResult = {
  version: typeof V101_PROPOSAL_INTELLIGENCE_VERSION;
  freezeVersion: typeof V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  strategy: BidStrategy;
  requirementIndex: RequirementIndex;
  blueprint: ProposalBlueprint | null;
  lifecycle: ProposalLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
