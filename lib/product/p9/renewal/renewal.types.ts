/**
 * Product P9 — Renewal types
 */

import type { RENEWAL_STATUSES } from "../customer-health/health.constants";

export type RenewalStatus = (typeof RENEWAL_STATUSES)[number];
export type RenewalMetadata = Record<string, unknown>;

export type RenewalOpportunity = {
  id: string;
  healthId: string;
  amount: number;
  status: RenewalStatus;
  renewBy: string;
  detail: string;
  metadata: RenewalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateRenewalInput = {
  id?: string;
  healthId: string;
  amount: number;
  renewBy: string;
  metadata?: RenewalMetadata;
};

export type UpdateRenewalStatusInput = {
  renewalId: string;
  status: RenewalStatus;
};
