/**
 * WP-65 — Approval Engine
 * Deterministic approval items from ReviewItems (read-only).
 */
import { getReview, type ReviewItem } from "./review";

export const FEAT_66_ID = "FEAT-66" as const;
export const APPROVAL_ENGINE_CAPABILITY = "ApprovalEngine" as const;

export const APPROVAL_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ApprovalItem = Readonly<{
  id: string;
  reviewId: string;
  status: ApprovalStatus;
  position: number;
}>;

export type BuildApprovalInput = Readonly<{
  reviews?: readonly ReviewItem[];
}>;

const STATUS_RANK: Record<ApprovalStatus, number> = {
  APPROVED: 0,
  PENDING: 1,
  REJECTED: 2,
};

let cachedApproval: ApprovalItem[] | null = null;

function cloneItem(row: ApprovalItem): ApprovalItem {
  return { ...row };
}

function reviewToApproval(status: ReviewItem["status"]): ApprovalStatus {
  if (status === "PASS") return "APPROVED";
  if (status === "WARN") return "PENDING";
  return "REJECTED";
}

/**
 * Build deterministic approval items from ReviewItems.
 * Sorted APPROVED → PENDING → REJECTED, then stable reviewId.
 */
export function buildApproval(
  input: BuildApprovalInput = {},
): ApprovalItem[] {
  const reviews = input.reviews ? [...input.reviews] : getReview();

  const ranked = reviews.map((r) => ({
    reviewId: r.id,
    status: reviewToApproval(r.status),
  }));

  ranked.sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    return a.reviewId.localeCompare(b.reviewId);
  });

  const out: ApprovalItem[] = ranked.map((row, index) => ({
    id: `approval-${row.reviewId}`,
    reviewId: row.reviewId,
    status: row.status,
    position: index + 1,
  }));

  cachedApproval = out.map(cloneItem);
  return cachedApproval.map(cloneItem);
}

/**
 * Get the last built approvals, or build if none cached.
 */
export function getApproval(): ApprovalItem[] {
  if (!cachedApproval) {
    return buildApproval();
  }
  return cachedApproval.map(cloneItem);
}

/** Test helper — clears cached approvals. */
export function clearApproval(): void {
  cachedApproval = null;
}
