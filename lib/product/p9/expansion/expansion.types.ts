/**
 * Product P9 — Expansion types
 */

import type { EXPANSION_STATUSES } from "../customer-health/health.constants";

export type ExpansionStatus = (typeof EXPANSION_STATUSES)[number];
export type ExpansionMetadata = Record<string, unknown>;

export type ExpansionOpportunity = {
  id: string;
  healthId: string;
  title: string;
  estimatedArr: number;
  status: ExpansionStatus;
  detail: string;
  metadata: ExpansionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpansionInput = {
  id?: string;
  healthId: string;
  title: string;
  estimatedArr: number;
  metadata?: ExpansionMetadata;
};

export type UpdateExpansionStatusInput = {
  expansionId: string;
  status: ExpansionStatus;
};
