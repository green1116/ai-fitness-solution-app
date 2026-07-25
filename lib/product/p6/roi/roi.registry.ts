/**
 * Product P6 — ROI registry
 */

import { ROI_STATUSES } from "../budget/budget.constants";
import { getBudget } from "../budget/budget.registry";
import type {
  CalculateRoiInput,
  RoiProjection,
  UpdateRoiStatusInput,
} from "./roi.types";

const rois = new Map<string, RoiProjection>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRoi(roi: RoiProjection): RoiProjection {
  return { ...roi, metadata: { ...roi.metadata } };
}

export function calculateRoi(input: CalculateRoiInput): RoiProjection {
  const budgetId = input.budgetId.trim();
  if (!budgetId) throw new Error("roi.budgetId is required");
  if (!Number.isFinite(input.horizonMonths) || input.horizonMonths <= 0) {
    throw new Error("roi.horizonMonths must be a positive number");
  }
  if (!Number.isFinite(input.expectedReturn) || input.expectedReturn < 0) {
    throw new Error("roi.expectedReturn must be a non-negative number");
  }
  if (!Number.isFinite(input.totalInvestment) || input.totalInvestment < 0) {
    throw new Error("roi.totalInvestment must be a non-negative number");
  }
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6roi");
  if (rois.has(id)) {
    throw new Error(`roi projection already exists: ${id}`);
  }

  const investment = input.totalInvestment;
  const roiPercent =
    investment === 0
      ? 0
      : Math.round(((input.expectedReturn - investment) / investment) * 10000) /
        100;
  const monthlyReturn = input.expectedReturn / input.horizonMonths;
  const paybackMonths =
    monthlyReturn <= 0
      ? input.horizonMonths
      : Math.min(
          input.horizonMonths,
          Math.ceil(investment / monthlyReturn),
        );

  const status = ROI_STATUSES[1];
  const roi: RoiProjection = {
    id,
    budgetId,
    horizonMonths: input.horizonMonths,
    expectedReturn: input.expectedReturn,
    roiPercent,
    paybackMonths,
    status,
    detail: `roi=${roiPercent}% payback=${paybackMonths}m`,
    metadata: { ...(input.metadata ?? {}) },
    calculatedAt: nowIso(),
  };
  rois.set(id, roi);
  return cloneRoi(roi);
}

export function updateRoiStatus(input: UpdateRoiStatusInput): RoiProjection {
  const roiId = input.roiId.trim();
  if (!roiId) throw new Error("roi.roiId is required");
  if (!(ROI_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid roi status: ${input.status}`);
  }
  const existing = rois.get(roiId);
  if (!existing) throw new Error(`roi projection not found: ${roiId}`);

  const updated: RoiProjection = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} roi=${existing.roiPercent}%`,
    metadata: { ...existing.metadata },
  };
  rois.set(roiId, updated);
  return cloneRoi(updated);
}

export function getRoi(id: string): RoiProjection | undefined {
  const roi = rois.get(id.trim());
  return roi ? cloneRoi(roi) : undefined;
}

export function listRois(filter?: { budgetId?: string }): RoiProjection[] {
  let result = [...rois.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((r) => r.budgetId === bid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRoi);
}

export function clearRois(): void {
  rois.clear();
}
