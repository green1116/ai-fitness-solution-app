/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-RECOVERY-1
 * Tenant-scoped recovery sidecar — reuses WorkspaceReviewRecovery row shape
 * with surfaceItemId slot = tenant itemId. No EWI/ESCS/frozen packs.
 */

import { prisma } from "@/lib/prisma";
import { parseTenantOpsOpportunityItemId } from "@/lib/runtime-ops/tenant-ops-action";
import {
  appendTenantOpsAudit,
  toTenantOpsAuditResult,
} from "@/lib/runtime-ops/tenant-ops-audit";
import { deriveTenantReviewEligible } from "@/lib/runtime-ops/tenant-ops-backlog";
import {
  failureClassForOutcome,
  type TenantOpsFailureClass,
} from "@/lib/runtime-ops/tenant-ops-failure";

export const TENANT_OPS_RECOVERY_ID = "tenant-ops-recovery-1" as const;
export const TENANT_OPS_RECOVERY_VERSION =
  "runtime-ops-tenant-review-recovery-1" as const;

export type TenantOpsRecoveryResult = Readonly<{
  workPackageId: typeof TENANT_OPS_RECOVERY_ID;
  version: typeof TENANT_OPS_RECOVERY_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  stage: string | null;
  recovered: boolean;
  result: "SUCCESS" | "FAILED";
  reason: string;
  failureClass?: TenantOpsFailureClass;
}>;

function failed(
  partial: Pick<TenantOpsRecoveryResult, "itemId" | "organizationId"> &
    Partial<
      Pick<
        TenantOpsRecoveryResult,
        "customerId" | "entityId" | "stage" | "recovered" | "reason"
      >
    >,
): TenantOpsRecoveryResult {
  const reason = partial.reason ?? "failed";
  return {
    workPackageId: TENANT_OPS_RECOVERY_ID,
    version: TENANT_OPS_RECOVERY_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    stage: partial.stage ?? null,
    recovered: partial.recovered ?? false,
    result: "FAILED",
    reason,
    failureClass: failureClassForOutcome("FAILED", reason),
  };
}

async function auditRecoveryBoundary(
  result: TenantOpsRecoveryResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "recover",
    organizationId: result.organizationId,
    userId,
    itemId: result.itemId,
    customerId: result.customerId,
    action: "recover",
    result: toTenantOpsAuditResult(result.result),
    reason: result.reason,
    failureClass: result.failureClass,
  });
}

/**
 * Persist tenant recovery for (organizationId, itemId).
 * Sidecar only — does not invoke frozen workspace recovery / intent / ESCS packs.
 */
export async function completeTenantOpsRecovery(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsRecoveryResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsRecoveryResult;

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
            select: { organizationId: true },
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
            reason: "not-review-eligible",
          });
        } else {
          const existing = await prisma.workspaceReviewRecovery.findUnique({
            where: {
              organizationId_surfaceItemId: {
                organizationId,
                surfaceItemId: itemId,
              },
            },
            select: { id: true },
          });

          if (existing) {
            result = {
              workPackageId: TENANT_OPS_RECOVERY_ID,
              version: TENANT_OPS_RECOVERY_VERSION,
              itemId,
              organizationId,
              customerId: opportunity.customerId,
              entityId: opportunity.id,
              stage,
              recovered: true,
              result: "SUCCESS",
              reason: "already-recovered",
            };
          } else {
            await prisma.workspaceReviewRecovery.upsert({
              where: {
                organizationId_surfaceItemId: {
                  organizationId,
                  surfaceItemId: itemId,
                },
              },
              create: {
                organizationId,
                surfaceItemId: itemId,
              },
              update: {},
            });

            result = {
              workPackageId: TENANT_OPS_RECOVERY_ID,
              version: TENANT_OPS_RECOVERY_VERSION,
              itemId,
              organizationId,
              customerId: opportunity.customerId,
              entityId: opportunity.id,
              stage,
              recovered: true,
              result: "SUCCESS",
              reason: "recovered",
            };
          }
        }
      }
    }
  }

  await auditRecoveryBoundary(result, input.userId);
  return result;
}

export async function isTenantOpsRecovered(input: {
  organizationId: string;
  itemId: string;
}): Promise<boolean> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();
  if (!organizationId || !itemId) return false;
  const row = await prisma.workspaceReviewRecovery.findUnique({
    where: {
      organizationId_surfaceItemId: {
        organizationId,
        surfaceItemId: itemId,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Batch read persisted recovery keys for tenant item ids (1 query).
 * surfaceItemId slot stores tenant itemId.
 */
export async function listTenantOpsRecoveredItemIds(
  organizationId: string,
  itemIds: readonly string[],
): Promise<ReadonlySet<string>> {
  const orgId = organizationId.trim();
  const ids = [
    ...new Set(
      itemIds
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
    ),
  ];
  if (!orgId || ids.length === 0) {
    return new Set();
  }

  const rows = await prisma.workspaceReviewRecovery.findMany({
    where: {
      organizationId: orgId,
      surfaceItemId: { in: ids },
    },
    select: { surfaceItemId: true },
  });

  return new Set(rows.map((row) => row.surfaceItemId));
}
