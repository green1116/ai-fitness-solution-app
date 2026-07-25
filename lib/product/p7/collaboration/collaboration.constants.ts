/**
 * Product P7 — Collaboration & Approval constants
 * BASE: enterprise-product-p6-budget-roi-v1
 * Isolated namespace: lib/product/p7
 */

export const PRODUCT_P7_COLLABORATION_APPROVAL_ID =
  "enterprise-product-p7-collaboration-approval-v1" as const;

export const PRODUCT_P7_COLLABORATION_APPROVAL_VERSION =
  "product-p7-1" as const;

export const PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION =
  "product-p7-collaboration-approval-freeze-1" as const;

export const PRODUCT_P7_COLLABORATION_APPROVAL_BASE =
  "enterprise-product-p6-budget-roi-v1" as const;

export const PRODUCT_P7_COLLABORATION_FREEZE_VERSION =
  "product-p7-collaboration-approval-freeze-1" as const;

export const COLLABORATION_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CLOSED",
] as const;

export const COMMENT_KINDS = [
  "GENERAL",
  "QUESTION",
  "CONCERN",
  "SUGGESTION",
  "RESOLVED",
] as const;

export const REVIEW_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETE",
  "ESCALATED",
] as const;

export const APPROVAL_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export const WORKFLOW_STEP_KINDS = [
  "SUBMIT",
  "REVIEW",
  "APPROVE",
  "NOTIFY",
  "CLOSE",
] as const;

export const NOTIFICATION_CHANNELS = [
  "IN_APP",
  "EMAIL",
  "SLACK",
  "WEBHOOK",
] as const;

export const ACTIVITY_KINDS = [
  "CREATED",
  "COMMENTED",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
  "DECIDED",
] as const;

export const DECISION_VERDICTS = [
  "GO",
  "NO_GO",
  "DEFER",
  "CONDITIONAL",
] as const;

export const P7_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P7_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
