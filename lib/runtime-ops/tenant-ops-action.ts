/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-ACTION-1
 * Tenant-scoped REVIEW action sidecar — no EWI/EWEB/EWER.
 */

import { prisma } from "@/lib/prisma";
import {
  deriveTenantOpsReason,
  deriveTenantReviewEligible,
} from "@/lib/runtime-ops/tenant-ops-backlog";

export const TENANT_OPS_REVIEW_ACTION_ID = "tenant-ops-review-1" as const;
export const TENANT_OPS_REVIEW_ACTION_VERSION =
  "runtime-ops-tenant-review-action-1" as const;

export const TENANT_OPS_REVIEW_RESULTS = [
  "SUCCESS",
  "BLOCKED",
  "FAILED",
] as const;
export type TenantOpsReviewResultKind =
  (typeof TENANT_OPS_REVIEW_RESULTS)[number];

export type TenantOpsReviewActionResult = Readonly<{
  workPackageId: typeof TENANT_OPS_REVIEW_ACTION_ID;
  version: typeof TENANT_OPS_REVIEW_ACTION_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  stage: string | null;
  result: TenantOpsReviewResultKind;
  executed: boolean;
  reason: string;
}>;

const ITEM_ID_PREFIX = "crm:opportunity:";

export function parseTenantOpsOpportunityItemId(
  itemId: string,
): string | null {
  const id = itemId.trim();
  if (!id.startsWith(ITEM_ID_PREFIX)) return null;
  const entityId = id.slice(ITEM_ID_PREFIX.length).trim();
  return entityId.length > 0 ? entityId : null;
}

function failed(
  partial: Pick<
    TenantOpsReviewActionResult,
    "itemId" | "organizationId"
  > &
    Partial<
      Pick<
        TenantOpsReviewActionResult,
        "customerId" | "entityId" | "stage" | "result" | "executed" | "reason"
      >
    >,
): TenantOpsReviewActionResult {
  return {
    workPackageId: TENANT_OPS_REVIEW_ACTION_ID,
    version: TENANT_OPS_REVIEW_ACTION_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    stage: partial.stage ?? null,
    result: partial.result ?? "FAILED",
    executed: partial.executed ?? false,
    reason: partial.reason ?? "failed",
  };
}

/**
 * Validate org ownership + reviewEligible; return local REVIEW result.
 * Sidecar only — does not invoke frozen workspace review / intent / execution packs.
 */
export async function runTenantOpsReviewAction(input: {
  organizationId: string;
  itemId: string;
}): Promise<TenantOpsReviewActionResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  if (!organizationId) {
    return failed({
      itemId,
      organizationId: "",
      reason: "organization-missing",
    });
  }
  if (!itemId) {
    return failed({
      itemId,
      organizationId,
      reason: "item-id-missing",
    });
  }

  const entityId = parseTenantOpsOpportunityItemId(itemId);
  if (!entityId) {
    return failed({
      itemId,
      organizationId,
      reason: "item-id-invalid",
    });
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: entityId },
    select: {
      id: true,
      stage: true,
      customerId: true,
      customer: {
        select: {
          organizationId: true,
          name: true,
        },
      },
    },
  });

  if (!opportunity) {
    return failed({
      itemId,
      organizationId,
      entityId,
      reason: "opportunity-not-found",
    });
  }

  if (opportunity.customer.organizationId !== organizationId) {
    return failed({
      itemId,
      organizationId,
      entityId,
      customerId: opportunity.customerId,
      stage: opportunity.stage,
      reason: "organization-mismatch",
    });
  }

  const stage = opportunity.stage.trim().toUpperCase();
  if (!deriveTenantReviewEligible(stage)) {
    return failed({
      itemId,
      organizationId,
      entityId,
      customerId: opportunity.customerId,
      stage,
      result: "BLOCKED",
      executed: false,
      reason: "not-review-eligible",
    });
  }

  return {
    workPackageId: TENANT_OPS_REVIEW_ACTION_ID,
    version: TENANT_OPS_REVIEW_ACTION_VERSION,
    itemId,
    organizationId,
    customerId: opportunity.customerId,
    entityId: opportunity.id,
    stage,
    result: "SUCCESS",
    executed: true,
    reason: deriveTenantOpsReason(stage, opportunity.customer.name),
  };
}
