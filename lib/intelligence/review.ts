/**
 * WP-64 — Review Engine
 * Deterministic review items from PlanItems (read-only).
 */
import { getPlan, type PlanItem } from "./plan";

export const FEAT_65_ID = "FEAT-65" as const;
export const REVIEW_ENGINE_CAPABILITY = "ReviewEngine" as const;

export const REVIEW_STATUSES = ["PASS", "WARN", "BLOCK"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewItem = Readonly<{
  id: string;
  planId: string;
  status: ReviewStatus;
  position: number;
}>;

export type BuildReviewInput = Readonly<{
  plans?: readonly PlanItem[];
}>;

const STATUS_RANK: Record<ReviewStatus, number> = {
  PASS: 0,
  WARN: 1,
  BLOCK: 2,
};

let cachedReview: ReviewItem[] | null = null;

function cloneItem(row: ReviewItem): ReviewItem {
  return { ...row };
}

function stageToStatus(stage: PlanItem["stage"]): ReviewStatus {
  if (stage === "START") return "PASS";
  if (stage === "MIDDLE") return "WARN";
  return "BLOCK";
}

/**
 * Build deterministic review items from PlanItems.
 * Sorted PASS → WARN → BLOCK, then stable planId.
 */
export function buildReview(input: BuildReviewInput = {}): ReviewItem[] {
  const plans = input.plans ? [...input.plans] : getPlan();

  const ranked = plans.map((p) => ({
    planId: p.id,
    status: stageToStatus(p.stage),
  }));

  ranked.sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    return a.planId.localeCompare(b.planId);
  });

  const out: ReviewItem[] = ranked.map((row, index) => ({
    id: `review-${row.planId}`,
    planId: row.planId,
    status: row.status,
    position: index + 1,
  }));

  cachedReview = out.map(cloneItem);
  return cachedReview.map(cloneItem);
}

/**
 * Get the last built reviews, or build if none cached.
 */
export function getReview(): ReviewItem[] {
  if (!cachedReview) {
    return buildReview();
  }
  return cachedReview.map(cloneItem);
}

/** Test helper — clears cached reviews. */
export function clearReview(): void {
  cachedReview = null;
}
