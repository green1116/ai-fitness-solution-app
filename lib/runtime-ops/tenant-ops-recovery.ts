/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-RECOVERY-1
 * Tenant-scoped recovery sidecar — reuses WorkspaceReviewRecovery row shape
 * with surfaceItemId slot = tenant itemId. No EWI/ESCS/frozen packs.
 */

import { prisma } from "@/lib/prisma";
import { parseTenantOpsOpportunityItemId } from "@/lib/runtime-ops/tenant-ops-action";
import { deriveTenantReviewEligible } from "@/lib/runtime-ops/tenant-ops-backlog";

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
    reason: partial.reason ?? "failed",
  };
}

/**
 * Persist tenant recovery for (organizationId, itemId).
 * Sidecar only — does not invoke frozen workspace recovery / intent / ESCS packs.
 */
export async function completeTenantOpsRecovery(input: {
  organizationId: string;
  itemId: string;
}): Promise<TenantOpsRecoveryResult> {
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
        select: { organizationId: true },
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
      reason: "not-review-eligible",
    });
  }

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
    return {
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
  }

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

  return {
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
