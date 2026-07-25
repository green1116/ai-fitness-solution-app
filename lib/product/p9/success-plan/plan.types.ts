/**
 * Product P9 — Success plan types
 */

import type { SUCCESS_PLAN_STATUSES } from "../customer-health/health.constants";

export type SuccessPlanStatus = (typeof SUCCESS_PLAN_STATUSES)[number];
export type SuccessPlanMetadata = Record<string, unknown>;

export type SuccessPlan = {
  id: string;
  healthId: string;
  name: string;
  objectives: string[];
  status: SuccessPlanStatus;
  detail: string;
  metadata: SuccessPlanMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateSuccessPlanInput = {
  id?: string;
  healthId: string;
  name: string;
  objectives?: string[];
  metadata?: SuccessPlanMetadata;
};

export type UpdateSuccessPlanStatusInput = {
  planId: string;
  status: SuccessPlanStatus;
};
