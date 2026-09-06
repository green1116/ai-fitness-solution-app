/**
 * WP-RUNTIME-OPS-TENANT-OPEN-DEAL-1
 * Tenant-scoped open deal for NEGOTIATION opportunities.
 * Uses openDealForOpportunity only — no createDeal / openDealFromOpportunity.
 */

import { openDealForOpportunity } from "@/lib/crm/deal/deal.service";
import { prisma } from "@/lib/prisma";
import { parseTenantOpsOpportunityItemId } from "@/lib/runtime-ops/tenant-ops-action";
import {
  appendTenantOpsAudit,
  toTenantOpsAuditResult,
} from "@/lib/runtime-ops/tenant-ops-audit";
import {
  failureClassForOutcome,
  type TenantOpsFailureClass,
} from "@/lib/runtime-ops/tenant-ops-failure";

export const TENANT_OPS_OPEN_DEAL_ID = "tenant-ops-open-deal-1" as const;
export const TENANT_OPS_OPEN_DEAL_VERSION =
  "runtime-ops-tenant-open-deal-1" as const;

export type TenantOpsOpenDealResultKind = "SUCCESS" | "BLOCKED" | "FAILED";

export type TenantOpsOpenDealResult = Readonly<{
  workPackageId: typeof TENANT_OPS_OPEN_DEAL_ID;
  version: typeof TENANT_OPS_OPEN_DEAL_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  stage: string | null;
  dealId: string | null;
  reused: boolean;
  action: "open-deal";
  result: TenantOpsOpenDealResultKind;
  executed: boolean;
  reason: string;
  failureClass?: TenantOpsFailureClass;
}>;

export function isTenantOpsOpenDealEligible(stage: string): boolean {
  return stage.trim().toUpperCase() === "NEGOTIATION";
}

function failed(
  partial: Pick<TenantOpsOpenDealResult, "itemId" | "organizationId"> &
    Partial<
      Omit<
        TenantOpsOpenDealResult,
        "workPackageId" | "version" | "itemId" | "organizationId" | "action"
      >
    >,
): TenantOpsOpenDealResult {
  const result = partial.result ?? "FAILED";
  const reason = partial.reason ?? "failed";
  return {
    workPackageId: TENANT_OPS_OPEN_DEAL_ID,
    version: TENANT_OPS_OPEN_DEAL_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    stage: partial.stage ?? null,
    dealId: partial.dealId ?? null,
    reused: partial.reused ?? false,
    action: "open-deal",
    result,
    executed: partial.executed ?? false,
    reason,
    failureClass: failureClassForOutcome(result, reason),
  };
}

async function auditOpenDealBoundary(
  result: TenantOpsOpenDealResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "open_deal",
    organizationId: result.organizationId,
    userId,
    itemId: result.itemId,
    customerId: result.customerId,
    action: result.action,
    result: toTenantOpsAuditResult(result.result),
    reason: result.reason,
    failureClass: result.failureClass,
  });
}

/**
 * Open (or reuse) an OPEN deal for a NEGOTIATION opportunity.
 * Does not mutate opportunity stage; does not close deals.
 */
export async function runTenantOpsOpenDealAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsOpenDealResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsOpenDealResult;

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
        if (!isTenantOpsOpenDealEligible(stage)) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            result: "BLOCKED",
            executed: false,
            reason: "not-open-deal-eligible",
          });
        } else {
          try {
            const { deal, reused } = await openDealForOpportunity({
              opportunityId: entityId,
              userId: input.userId,
            });
            result = {
              workPackageId: TENANT_OPS_OPEN_DEAL_ID,
              version: TENANT_OPS_OPEN_DEAL_VERSION,
              itemId,
              organizationId,
              customerId: opportunity.customerId,
              entityId: opportunity.id,
              stage,
              dealId: deal.id,
              reused,
              action: "open-deal",
              result: "SUCCESS",
              executed: !reused,
              reason: reused ? "deal-already-open" : "deal-opened",
            };
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "open-deal-failed";
            result = failed({
              itemId,
              organizationId,
              entityId,
              customerId: opportunity.customerId,
              stage,
              reason: message,
            });
          }
        }
      }
    }
  }

  await auditOpenDealBoundary(result, input.userId);
  return result;
}
