/**
 * Evolution P1 — Improvement Tracking
 */

import { IMPROVEMENT_STATUSES } from "./evolution.constants";
import { getOperationsIntelligenceProfile } from "./evolution.intelligence";
import { getOptimizationRecommendation } from "./evolution.recommendation";
import type {
  ImprovementRecord,
  ImprovementStatus,
  TrackImprovementInput,
  UpdateImprovementInput,
} from "./evolution.types";

const improvements = new Map<string, ImprovementRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneImprovement(record: ImprovementRecord): ImprovementRecord {
  return { ...record };
}

export function trackImprovement(
  input: TrackImprovementInput,
): ImprovementRecord {
  const intelligenceProfileId = input.intelligenceProfileId.trim();
  const recommendationId = input.recommendationId.trim();

  if (!getOperationsIntelligenceProfile(intelligenceProfileId)) {
    throw new Error(
      `operations intelligence profile not found: ${intelligenceProfileId}`,
    );
  }
  const recommendation = getOptimizationRecommendation(recommendationId);
  if (
    !recommendation ||
    recommendation.intelligenceProfileId !== intelligenceProfileId
  ) {
    throw new Error(
      `optimization recommendation not found: ${recommendationId}`,
    );
  }

  const status: ImprovementStatus = input.status ?? "PROPOSED";
  if (!(IMPROVEMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid improvement status: ${status}`);
  }

  const progress = input.progress ?? 0;
  if (progress < 0 || progress > 100) {
    throw new Error("improvement progress must be 0..100");
  }

  const id = input.id?.trim() || createId("improve");
  if (improvements.has(id)) {
    throw new Error(`improvement record already exists: ${id}`);
  }

  const now = nowIso();
  const record: ImprovementRecord = {
    id,
    intelligenceProfileId,
    recommendationId,
    status,
    progress,
    detail: input.detail?.trim() || `tracking ${recommendation.title}`,
    createdAt: now,
    updatedAt: now,
    completedAt: status === "COMPLETED" ? now : undefined,
  };
  improvements.set(id, record);
  return cloneImprovement(record);
}

export function updateImprovement(
  input: UpdateImprovementInput,
): ImprovementRecord {
  const record = improvements.get(input.improvementId.trim());
  if (!record) {
    throw new Error(`improvement record not found: ${input.improvementId}`);
  }

  if (input.status) {
    if (!(IMPROVEMENT_STATUSES as readonly string[]).includes(input.status)) {
      throw new Error(`invalid improvement status: ${input.status}`);
    }
    record.status = input.status;
  }
  if (input.progress !== undefined) {
    if (input.progress < 0 || input.progress > 100) {
      throw new Error("improvement progress must be 0..100");
    }
    record.progress = input.progress;
  }
  if (input.detail) record.detail = input.detail.trim();

  const now = nowIso();
  record.updatedAt = now;
  if (record.status === "COMPLETED") {
    record.progress = 100;
    record.completedAt = now;
  }
  improvements.set(record.id, record);
  return cloneImprovement(record);
}

export function getImprovementRecord(
  id: string,
): ImprovementRecord | undefined {
  const record = improvements.get(id.trim());
  return record ? cloneImprovement(record) : undefined;
}

export function listImprovementRecords(filter?: {
  intelligenceProfileId?: string;
  status?: ImprovementStatus;
}): ImprovementRecord[] {
  let result = [...improvements.values()];
  if (filter?.intelligenceProfileId) {
    const pid = filter.intelligenceProfileId.trim();
    result = result.filter((r) => r.intelligenceProfileId === pid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneImprovement);
}

export function clearImprovementRecords(): void {
  improvements.clear();
}
