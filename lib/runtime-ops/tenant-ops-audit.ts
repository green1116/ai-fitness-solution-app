/**
 * WP-RUNTIME-OPS-TENANT-AUDIT-1
 * Tenant Ops audit trail sidecar — reuses CRMActivity via logCRMActivity.
 * No schema / migration. Audit write failures never fail the business action.
 */

import { logCRMActivity } from "@/lib/crm/activity/activity.tracker";
import { prisma } from "@/lib/prisma";
import { failureClassForOutcome } from "@/lib/runtime-ops/tenant-ops-failure";

export const TENANT_OPS_AUDIT_ID = "tenant-ops-audit-1" as const;
export const TENANT_OPS_AUDIT_VERSION =
  "runtime-ops-tenant-audit-1" as const;

export const TENANT_OPS_AUDIT_KINDS = [
  "review",
  "recover",
  "execute",
  "open_deal",
  "close_won",
  "close_lost",
] as const;
export type TenantOpsAuditKind = (typeof TENANT_OPS_AUDIT_KINDS)[number];

export const TENANT_OPS_AUDIT_TYPES = {
  review: "tenant_ops.review",
  recover: "tenant_ops.recover",
  execute: "tenant_ops.execute",
  open_deal: "tenant_ops.open_deal",
  close_won: "tenant_ops.close_won",
  close_lost: "tenant_ops.close_lost",
} as const satisfies Record<TenantOpsAuditKind, string>;

export type TenantOpsAuditResult = "SUCCESS" | "FAILED";

export type TenantOpsAuditMeta = Readonly<{
  organizationId: string;
  userId: string | null;
  itemId: string;
  customerId: string;
  action: string;
  result: TenantOpsAuditResult;
  reason: string;
  timestamp: string;
  failureClass?: "RETRYABLE" | "TERMINAL";
}>;

/**
 * Map action-boundary outcomes to audit SUCCESS|FAILED.
 * BLOCKED and other non-SUCCESS → FAILED.
 */
export function toTenantOpsAuditResult(
  result: string,
): TenantOpsAuditResult {
  return result === "SUCCESS" ? "SUCCESS" : "FAILED";
}

/**
 * Append one tenant Ops audit row. Skips when customerId missing.
 * Swallows all errors so callers never fail on audit.
 */
export async function appendTenantOpsAudit(input: {
  kind: TenantOpsAuditKind;
  organizationId: string;
  userId?: string | null;
  itemId: string;
  customerId: string | null;
  action: string;
  result: TenantOpsAuditResult;
  reason: string;
  failureClass?: "RETRYABLE" | "TERMINAL";
}): Promise<void> {
  const customerId = input.customerId?.trim() ?? "";
  if (!customerId) return;

  try {
    const timestamp = new Date().toISOString();
    const meta: TenantOpsAuditMeta = {
      organizationId: input.organizationId,
      userId: input.userId?.trim() ? input.userId.trim() : null,
      itemId: input.itemId,
      customerId,
      action: input.action,
      result: input.result,
      reason: input.reason,
      timestamp,
      ...(input.failureClass ? { failureClass: input.failureClass } : {}),
    };
    await logCRMActivity({
      customerId,
      type: TENANT_OPS_AUDIT_TYPES[input.kind],
      meta: { ...meta },
    });
  } catch {
    // Audit must not fail business action.
  }
}

const OPPORTUNITY_ITEM_PREFIX = "crm:opportunity:";

function parseOpportunityItemId(itemId: string): string | null {
  const id = itemId.trim();
  if (!id.startsWith(OPPORTUNITY_ITEM_PREFIX)) return null;
  const entityId = id.slice(OPPORTUNITY_ITEM_PREFIX.length).trim();
  return entityId.length > 0 ? entityId : null;
}

/**
 * Resolve a customerId for gate-failure audit via item ownership.
 * Returns null when item/org cannot be anchored — no CRMActivity without customer.
 */
async function resolveGateAuditCustomerId(
  itemId: string,
  organizationId: string,
): Promise<string | null> {
  const entityId = parseOpportunityItemId(itemId);
  if (!entityId || !organizationId.trim()) return null;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: entityId },
    select: {
      customerId: true,
      customer: { select: { organizationId: true } },
    },
  });
  if (!opportunity) return null;
  if (opportunity.customer.organizationId !== organizationId.trim()) {
    return null;
  }
  return opportunity.customerId;
}

/**
 * Audit submit org/role/auth gate failures when session userId + org + item
 * customer anchor are available. Never throws; never mutates business state.
 */
export async function appendTenantOpsGateFailureAudit(input: {
  kind: "review" | "recover" | "execute";
  organizationId: string;
  userId: string | null | undefined;
  itemId: string;
  action: "review" | "recover" | "execute";
  reason: string;
}): Promise<void> {
  const userId = input.userId?.trim() ?? "";
  const organizationId = input.organizationId.trim();
  if (!userId || !organizationId) return;

  try {
    const customerId = await resolveGateAuditCustomerId(
      input.itemId,
      organizationId,
    );
    if (!customerId) return;

    await appendTenantOpsAudit({
      kind: input.kind,
      organizationId,
      userId,
      itemId: input.itemId.trim(),
      customerId,
      action: input.action,
      result: "FAILED",
      reason: input.reason,
      failureClass: failureClassForOutcome("FAILED", input.reason),
    });
  } catch {
    // Gate audit must not alter the original gate failure result.
  }
}
