/**
 * Operations O3 — Resolution types + readiness / manifest
 */

import type {
  O3_MANAGER_STATUSES,
  O3_READINESS_VERDICTS,
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
  RESOLUTION_OUTCOMES,
} from "../ticket/ticket.constants";

export type ResolutionOutcome = (typeof RESOLUTION_OUTCOMES)[number];
export type O3ReadinessVerdict = (typeof O3_READINESS_VERDICTS)[number];
export type O3ManagerStatus = (typeof O3_MANAGER_STATUSES)[number];
export type ResolutionMetadata = Record<string, unknown>;

export type ResolutionTracking = {
  id: string;
  ticketId: string;
  outcome: ResolutionOutcome;
  summary: string;
  articleId?: string;
  detail: string;
  metadata: ResolutionMetadata;
  resolvedAt: string;
};

export type TrackResolutionInput = {
  id?: string;
  ticketId: string;
  outcome: ResolutionOutcome;
  summary: string;
  articleId?: string;
  metadata?: ResolutionMetadata;
};

export type SupportResolutionReport = {
  id: string;
  title: string;
  ticketCount: number;
  resolvedCount: number;
  slaHitRate: number;
  highlights: string[];
  detail: string;
  generatedAt: string;
};

export type GenerateResolutionReportInput = {
  id?: string;
  title?: string;
  accountRef?: string;
};

export type O3ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type O3ReadinessResult = {
  verdict: O3ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: O3ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type O3RegistryManifest = {
  foundationId: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_ID;
  version: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION;
  freezeVersion: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION;
  base: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_BASE;
  ticketCount: number;
  workflowCount: number;
  assignmentCount: number;
  articleCount: number;
  indexCount: number;
  policyCount: number;
  slaMetricsCount: number;
  resolutionCount: number;
  reportCount: number;
};
