/**
 * Operations O1 — Success types
 */

import type { SUCCESS_PLAN_STATUSES } from "./success.constants";

export type SuccessPlanStatus = (typeof SUCCESS_PLAN_STATUSES)[number];
export type SuccessMetadata = Record<string, unknown>;

export type SuccessPlan = {
  id: string;
  customerId: string;
  title: string;
  status: SuccessPlanStatus;
  objectives: string[];
  detail: string;
  metadata: SuccessMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateSuccessPlanInput = {
  id?: string;
  customerId: string;
  title: string;
  objectives?: string[];
  status?: SuccessPlanStatus;
  metadata?: SuccessMetadata;
};

export type SuccessTracking = {
  id: string;
  planId: string;
  progress: number;
  milestone: string;
  detail: string;
  trackedAt: string;
};

export type TrackSuccessProgressInput = {
  id?: string;
  planId: string;
  progress: number;
  milestone: string;
};
