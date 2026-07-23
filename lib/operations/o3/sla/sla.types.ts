/**
 * Operations O3 — SLA types
 */

import type { SLA_TARGETS, TICKET_PRIORITIES } from "../ticket/ticket.constants";

export type SlaTarget = (typeof SLA_TARGETS)[number];
export type SlaPriority = (typeof TICKET_PRIORITIES)[number];
export type SlaMetadata = Record<string, unknown>;

export type SlaPolicy = {
  id: string;
  name: string;
  target: SlaTarget;
  priority: SlaPriority;
  thresholdMinutes: number;
  detail: string;
  metadata: SlaMetadata;
  createdAt: string;
};

export type RegisterSlaPolicyInput = {
  id?: string;
  name: string;
  target: SlaTarget;
  priority: SlaPriority;
  thresholdMinutes: number;
  metadata?: SlaMetadata;
};

export type SlaMetrics = {
  id: string;
  ticketId: string;
  policyId: string;
  elapsedMinutes: number;
  withinSla: boolean;
  detail: string;
  measuredAt: string;
};

export type MeasureSlaMetricsInput = {
  id?: string;
  ticketId: string;
  policyId: string;
  elapsedMinutes: number;
};
