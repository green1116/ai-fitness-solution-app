/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-ACTION-1
 * Tenant-scoped REVIEW action sidecar — no EWI/EWEB/EWER.
 */

import { prisma } from "@/lib/prisma";
import {
  appendTenantOpsAudit,
  toTenantOpsAuditResult,
} from "@/lib/runtime-ops/tenant-ops-audit";
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

async function auditReviewBoundary(
  result: TenantOpsReviewActionResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "review",
    organizationId: result.organizationId,
    userId,
    itemId: result.itemId,
    customerId: result.customerId,
    action: "review",
    result: toTenantOpsAuditResult(result.result),
    reason: result.reason,
  });
}

/**
 * Validate org ownership + reviewEligible; return local REVIEW result.
 * Sidecar only — does not invoke frozen workspace review / intent / execution packs.
 */
export async function runTenantOpsReviewAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsReviewActionResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsReviewActionResult;

  if (!organizationId) {
    result = failed({
      itemId,
      organizationId: "",
      reason: "organization-missing",
    });
  } else if (!itemId) {
    result = failed({
      itemId,
      organizationId,
      reason: "item-id-missing",
    });
  } else {
    const entityId = parseTenantOpsOpportunityItemId(itemId);
    if (!entityId) {
      result = failed({
        itemId,
        organizationId,
        reason: "item-id-invalid",
      });
    } else {
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
        result = failed({
          itemId,
          organizationId,
          entityId,
          reason: "opportunity-not-found",
        });
      } else if (opportunity.customer.organizationId !== organizationId) {
        result = failed({
          itemId,
          organizationId,
          entityId,
          customerId: opportunity.customerId,
          stage: opportunity.stage,
          reason: "organization-mismatch",
        });
      } else {
        const stage = opportunity.stage.trim().toUpperCase();
        if (!deriveTenantReviewEligible(stage)) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            result: "BLOCKED",
            executed: false,
            reason: "not-review-eligible",
          });
        } else {
          result = {
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
      }
    }
  }

  await auditReviewBoundary(result, input.userId);
  return result;
}
