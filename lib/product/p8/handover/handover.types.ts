/**
 * Product P8 — Handover types
 */

import type { HANDOVER_STATUSES } from "../tender/tender.constants";

export type HandoverStatus = (typeof HANDOVER_STATUSES)[number];
export type HandoverMetadata = Record<string, unknown>;

export type TenderHandover = {
  id: string;
  tenderId: string;
  submissionId: string;
  recipient: string;
  status: HandoverStatus;
  notes: string;
  detail: string;
  metadata: HandoverMetadata;
  scheduledAt: string;
  completedAt?: string;
};

export type CreateHandoverInput = {
  id?: string;
  tenderId: string;
  submissionId: string;
  recipient: string;
  notes?: string;
  metadata?: HandoverMetadata;
};

export type CompleteHandoverInput = {
  handoverId: string;
  notes?: string;
};
