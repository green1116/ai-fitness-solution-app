/**
 * E01-P2 — Tender Document Understanding Engine types
 * TenderWorkspace → DocumentStructure → RequirementIndex lifecycle
 */

import type { TenderWorkspace } from "../intake/intake.types";

export const V101_TENDER_UNDERSTANDING_VERSION = "v101-tender-understanding-1" as const;
export const V101_TENDER_UNDERSTANDING_FREEZE_VERSION =
  "v101-tender-understanding-freeze-1" as const;

export type DocumentSectionKind =
  | "cover"
  | "scope"
  | "technical"
  | "commercial"
  | "evaluation"
  | "appendix"
  | "other";

export type RequirementPriority = "must" | "preferred" | "optional";

export type RequirementCategory =
  | "functional"
  | "technical"
  | "equipment"
  | "space"
  | "compliance"
  | "schedule"
  | "budget"
  | "deliverable"
  | "other";

export type UnderstandingLifecycleStage =
  | "workspace"
  | "structure"
  | "requirements";

export type UnderstandingStatus =
  | "pending"
  | "structured"
  | "indexed"
  | "ready"
  | "failed";

export type DocumentSection = {
  id: string;
  kind: DocumentSectionKind;
  title: string;
  order: number;
  pageStart?: number;
  pageEnd?: number;
  excerpt?: string;
  readOnly: true;
};

export type DocumentStructure = {
  id: string;
  workspaceId: string;
  title: string;
  sectionCount: number;
  sections: DocumentSection[];
  language: "zh" | "en" | "mixed";
  status: UnderstandingStatus;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type RequirementIndexEntry = {
  id: string;
  sectionId: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  text: string;
  pageRef?: number;
  tags: string[];
  readOnly: true;
};

export type RequirementIndex = {
  id: string;
  structureId: string;
  workspaceId: string;
  entryCount: number;
  mustCount: number;
  preferredCount: number;
  optionalCount: number;
  entries: RequirementIndexEntry[];
  status: UnderstandingStatus;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type UnderstandingLifecycleTransition = {
  from: UnderstandingLifecycleStage;
  to: UnderstandingLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type UnderstandingLifecycle = {
  current: UnderstandingLifecycleStage;
  stages: UnderstandingLifecycleStage[];
  transitions: UnderstandingLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type UnderstandingKernelInput = {
  deploymentId?: string;
  workspace: TenderWorkspace;
  rawText?: string;
  languageHint?: "zh" | "en" | "mixed";
};

export type UnderstandingKernelResult = {
  version: typeof V101_TENDER_UNDERSTANDING_VERSION;
  freezeVersion: typeof V101_TENDER_UNDERSTANDING_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  workspace: TenderWorkspace;
  structure: DocumentStructure | null;
  requirementIndex: RequirementIndex | null;
  lifecycle: UnderstandingLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
