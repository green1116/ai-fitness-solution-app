/**
 * Operations O3 — Support types
 */

import type { SUPPORT_WORKFLOW_STAGES } from "../ticket/ticket.constants";

export type SupportWorkflowStage =
  (typeof SUPPORT_WORKFLOW_STAGES)[number];
export type SupportMetadata = Record<string, unknown>;

export type SupportWorkflow = {
  id: string;
  ticketId: string;
  stage: SupportWorkflowStage;
  note: string;
  detail: string;
  metadata: SupportMetadata;
  updatedAt: string;
};

export type AdvanceSupportWorkflowInput = {
  id?: string;
  ticketId: string;
  stage: SupportWorkflowStage;
  note?: string;
  metadata?: SupportMetadata;
};

export type SupportAssignment = {
  id: string;
  ticketId: string;
  assignee: string;
  team: string;
  detail: string;
  assignedAt: string;
};

export type AssignSupportInput = {
  id?: string;
  ticketId: string;
  assignee: string;
  team: string;
};
