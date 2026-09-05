/**
 * WP-RUNTIME-OPS-TENANT-EXECUTION-1
 * Tenant-scoped stage advance via CRM pipeline — no EWI/EWEB/EWER.
 */

import {
  advanceOpportunityToNegotiation,
  advanceOpportunityToProposal,
} from "@/lib/crm/pipeline/crm.pipeline.engine";
import { prisma } from "@/lib/prisma";
import { parseTenantOpsOpportunityItemId } from "@/lib/runtime-ops/tenant-ops-action";

export const TENANT_OPS_EXECUTE_ID = "tenant-ops-execute-1" as const;
export const TENANT_OPS_EXECUTE_VERSION =
  "runtime-ops-tenant-execution-1" as const;

export type TenantOpsExecuteTargetStage = "PROPOSAL" | "NEGOTIATION";

export type TenantOpsExecuteResultKind = "SUCCESS" | "BLOCKED" | "FAILED";

export type TenantOpsExecuteActionResult = Readonly<{
  workPackageId: typeof TENANT_OPS_EXECUTE_ID;
  version: typeof TENANT_OPS_EXECUTE_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  fromStage: string | null;
  toStage: string | null;
  action: string | null;
  result: TenantOpsExecuteResultKind;
  executed: boolean;
  reason: string;
}>;

/**
 * v1 executable targets only.
 * NEGOTIATION stays REVIEW/Recovery — not executable here.
 */
export function deriveTenantOpsExecuteTarget(
  stage: string,
): TenantOpsExecuteTargetStage | null {
  const s = stage.trim().toUpperCase();
  if (s === "INIT") return "PROPOSAL";
  if (s === "PROPOSAL") return "NEGOTIATION";
  return null;
}

export function isTenantOpsExecuteEligible(stage: string): boolean {
  return deriveTenantOpsExecuteTarget(stage) !== null;
}

function failed(
  partial: Pick<TenantOpsExecuteActionResult, "itemId" | "organizationId"> &
    Partial<
      Omit<TenantOpsExecuteActionResult, "workPackageId" | "version" | "itemId" | "organizationId">
    >,
): TenantOpsExecuteActionResult {
  return {
    workPackageId: TENANT_OPS_EXECUTE_ID,
    version: TENANT_OPS_EXECUTE_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    fromStage: partial.fromStage ?? null,
    toStage: partial.toStage ?? null,
    action: partial.action ?? null,
    result: partial.result ?? "FAILED",
    executed: partial.executed ?? false,
    reason: partial.reason ?? "failed",
  };
}

/**
 * Advance Opportunity stage via existing CRM pipeline helpers.
 * Does not open deals; does not call EWEB/EWER.
 */
export async function runTenantOpsExecuteAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsExecuteActionResult> {
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
      fromStage: opportunity.stage,
      reason: "organization-mismatch",
    });
  }

  const fromStage = opportunity.stage.trim().toUpperCase();
  const toStage = deriveTenantOpsExecuteTarget(fromStage);

  if (!toStage) {
    return failed({
      itemId,
      organizationId,
      entityId,
      customerId: opportunity.customerId,
      fromStage,
      result: "BLOCKED",
      executed: false,
      reason:
        fromStage === "NEGOTIATION"
          ? "negotiation-review-only"
          : "not-executable",
    });
  }

  const action =
    toStage === "PROPOSAL" ? "prepare-proposal" : "advance-proposal";

  try {
    if (toStage === "PROPOSAL") {
      await advanceOpportunityToProposal(entityId, input.userId);
    } else {
      await advanceOpportunityToNegotiation(entityId, input.userId);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "execute-failed";
    return failed({
      itemId,
      organizationId,
      entityId,
      customerId: opportunity.customerId,
      fromStage,
      toStage,
      action,
      reason: message,
    });
  }

  return {
    workPackageId: TENANT_OPS_EXECUTE_ID,
    version: TENANT_OPS_EXECUTE_VERSION,
    itemId,
    organizationId,
    customerId: opportunity.customerId,
    entityId: opportunity.id,
    fromStage,
    toStage,
    action,
    result: "SUCCESS",
    executed: true,
    reason: `advanced ${fromStage} → ${toStage}`,
  };
}
