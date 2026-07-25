/**
 * Product P7 — Collaboration types + readiness / manifest
 */

import type {
  COLLABORATION_STATUSES,
  P7_MANAGER_STATUSES,
  P7_READINESS_VERDICTS,
  PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
  PRODUCT_P7_COLLABORATION_APPROVAL_ID,
  PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
} from "./collaboration.constants";

export type CollaborationStatus =
  (typeof COLLABORATION_STATUSES)[number];
export type P7ReadinessVerdict = (typeof P7_READINESS_VERDICTS)[number];
export type P7ManagerStatus = (typeof P7_MANAGER_STATUSES)[number];
export type CollaborationMetadata = Record<string, unknown>;

export type CollaborationThread = {
  id: string;
  budgetRef: string;
  title: string;
  owner: string;
  status: CollaborationStatus;
  detail: string;
  metadata: CollaborationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateCollaborationInput = {
  id?: string;
  budgetRef: string;
  title: string;
  owner: string;
  metadata?: CollaborationMetadata;
};

export type UpdateCollaborationStatusInput = {
  collaborationId: string;
  status: CollaborationStatus;
};

export type P7ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P7ReadinessResult = {
  verdict: P7ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P7ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P7RegistryManifest = {
  foundationId: typeof PRODUCT_P7_COLLABORATION_APPROVAL_ID;
  version: typeof PRODUCT_P7_COLLABORATION_APPROVAL_VERSION;
  freezeVersion: typeof PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION;
  base: typeof PRODUCT_P7_COLLABORATION_APPROVAL_BASE;
  collaborationCount: number;
  commentCount: number;
  reviewCount: number;
  approvalCount: number;
  workflowCount: number;
  notificationCount: number;
  activityCount: number;
  decisionCount: number;
};
