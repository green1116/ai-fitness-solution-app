/**
 * WP-RUNTIME-OPS-TENANT-FAILURE-1
 * Classify action-boundary failure reasons as RETRYABLE | TERMINAL.
 * No auto-retry — classification only.
 */

export const TENANT_OPS_FAILURE_ID = "tenant-ops-failure-1" as const;
export const TENANT_OPS_FAILURE_VERSION =
  "runtime-ops-tenant-failure-1" as const;

export const TENANT_OPS_FAILURE_CLASSES = ["RETRYABLE", "TERMINAL"] as const;
export type TenantOpsFailureClass =
  (typeof TENANT_OPS_FAILURE_CLASSES)[number];

/** Stable reasons that should not be blindly retried. */
const TERMINAL_REASONS = new Set<string>([
  "organization-missing",
  "organization-forbidden",
  "organization-mismatch",
  "role-forbidden",
  "item-id-missing",
  "item-id-invalid",
  "opportunity-not-found",
  "not-review-eligible",
  "negotiation-review-only",
  "not-executable",
]);

/** Known transient / refresh-then-retry reasons. */
const RETRYABLE_REASONS = new Set<string>([
  "auth-required",
  "stage-changed",
  "failed",
  "execute-failed",
]);

/**
 * Map a failure reason string to RETRYABLE | TERMINAL.
 * Unknown reasons (e.g. CRM pipeline messages) default to RETRYABLE.
 */
export function classifyTenantOpsFailure(
  reason: string,
): TenantOpsFailureClass {
  const r = reason.trim();
  if (TERMINAL_REASONS.has(r)) return "TERMINAL";
  if (RETRYABLE_REASONS.has(r)) return "RETRYABLE";
  return "RETRYABLE";
}

/**
 * Attach failureClass only for non-SUCCESS outcomes.
 * SUCCESS / idempotent paths return undefined.
 */
export function failureClassForOutcome(
  result: string,
  reason: string,
): TenantOpsFailureClass | undefined {
  if (result === "SUCCESS") return undefined;
  return classifyTenantOpsFailure(reason);
}
