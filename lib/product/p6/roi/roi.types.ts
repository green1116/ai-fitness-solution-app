/**
 * Product P6 — ROI types
 */

import type { ROI_STATUSES } from "../budget/budget.constants";

export type RoiStatus = (typeof ROI_STATUSES)[number];
export type RoiMetadata = Record<string, unknown>;

export type RoiProjection = {
  id: string;
  budgetId: string;
  horizonMonths: number;
  expectedReturn: number;
  roiPercent: number;
  paybackMonths: number;
  status: RoiStatus;
  detail: string;
  metadata: RoiMetadata;
  calculatedAt: string;
};

export type CalculateRoiInput = {
  id?: string;
  budgetId: string;
  horizonMonths: number;
  expectedReturn: number;
  totalInvestment: number;
  metadata?: RoiMetadata;
};

export type UpdateRoiStatusInput = {
  roiId: string;
  status: RoiStatus;
};
