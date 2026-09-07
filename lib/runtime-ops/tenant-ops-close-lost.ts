/**
 * WP-RUNTIME-OPS-TENANT-CLOSE-LOST-1
 * Tenant-scoped close-lost for NEGOTIATION opportunities with an OPEN deal.
 * Uses closeDealLost only — no closeDealWon.
 */

import { closeDealLost } from "@/lib/crm/deal/deal.service";
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

export const TENANT_OPS_CLOSE_LOST_ID = "tenant-ops-close-lost-1" as const;
export const TENANT_OPS_CLOSE_LOST_VERSION =
  "runtime-ops-tenant-close-lost-1" as const;

export type TenantOpsCloseLostResultKind = "SUCCESS" | "BLOCKED" | "FAILED";

export type TenantOpsCloseLostResult = Readonly<{
  workPackageId: typeof TENANT_OPS_CLOSE_LOST_ID;
  version: typeof TENANT_OPS_CLOSE_LOST_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  stage: string | null;
  dealId: string | null;
  dealStatus: string | null;
  reused: boolean;
  action: "close-lost";
  result: TenantOpsCloseLostResultKind;
  executed: boolean;
  reason: string;
  failureClass?: TenantOpsFailureClass;
}>;

/** UI / primary gate: close-lost is offered for NEGOTIATION only. */
export function isTenantOpsCloseLostEligible(stage: string): boolean {
  return stage.trim().toUpperCase() === "NEGOTIATION";
}

function failed(
  partial: Pick<TenantOpsCloseLostResult, "itemId" | "organizationId"> &
    Partial<
      Omit<
        TenantOpsCloseLostResult,
        "workPackageId" | "version" | "itemId" | "organizationId" | "action"
      >
    >,
): TenantOpsCloseLostResult {
  const result = partial.result ?? "FAILED";
  const reason = partial.reason ?? "failed";
  return {
    workPackageId: TENANT_OPS_CLOSE_LOST_ID,
    version: TENANT_OPS_CLOSE_LOST_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    stage: partial.stage ?? null,
    dealId: partial.dealId ?? null,
    dealStatus: partial.dealStatus ?? null,
    reused: partial.reused ?? false,
    action: "close-lost",
    result,
    executed: partial.executed ?? false,
    reason,
    failureClass: failureClassForOutcome(result, reason),
  };
}

async function auditCloseLostBoundary(
  result: TenantOpsCloseLostResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "close_lost",
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
 * Close an OPEN deal as lost for a NEGOTIATION opportunity.
 * CLOSED_LOST + opportunity LOST → idempotent SUCCESS.
 * Blocks CLOSED_WON / cross-terminal / non-NEGOTIATION (except idempotent path).
 * Does not widen LOST eligibility to INIT/PROPOSAL.
 */
export async function runTenantOpsCloseLostAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsCloseLostResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsCloseLostResult;

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
          deals: {
            select: { id: true, status: true, createdAt: true },
            orderBy: { createdAt: "asc" },
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
        const openDeal = opportunity.deals.find((d) => d.status === "OPEN");
        const wonDeal = opportunity.deals.find(
          (d) => d.status === "CLOSED_WON",
        );
        const lostDeal = opportunity.deals.find(
          (d) => d.status === "CLOSED_LOST",
        );

        if (lostDeal && stage === "LOST") {
          result = {
            workPackageId: TENANT_OPS_CLOSE_LOST_ID,
            version: TENANT_OPS_CLOSE_LOST_VERSION,
            itemId,
            organizationId,
            customerId: opportunity.customerId,
            entityId: opportunity.id,
            stage,
            dealId: lostDeal.id,
            dealStatus: lostDeal.status,
            reused: true,
            action: "close-lost",
            result: "SUCCESS",
            executed: false,
            reason: "deal-already-closed-lost",
          };
        } else if (wonDeal && !openDeal) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: wonDeal.id,
            dealStatus: wonDeal.status,
            result: "BLOCKED",
            executed: false,
            reason: "deal-closed-won",
          });
        } else if (lostDeal && stage === "WON") {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: lostDeal.id,
            dealStatus: lostDeal.status,
            result: "BLOCKED",
            executed: false,
            reason: "deal-cross-terminal",
          });
        } else if (wonDeal && stage === "LOST") {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: wonDeal.id,
            dealStatus: wonDeal.status,
            result: "BLOCKED",
            executed: false,
            reason: "deal-cross-terminal",
          });
        } else if (!isTenantOpsCloseLostEligible(stage)) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: openDeal?.id ?? wonDeal?.id ?? lostDeal?.id ?? null,
            dealStatus:
              openDeal?.status ?? wonDeal?.status ?? lostDeal?.status ?? null,
            result: "BLOCKED",
            executed: false,
            reason: "not-close-lost-eligible",
          });
        } else if (!openDeal) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: lostDeal?.id ?? null,
            dealStatus: lostDeal?.status ?? null,
            result: "BLOCKED",
            executed: false,
            reason: lostDeal ? "deal-cross-terminal" : "no-open-deal",
          });
        } else {
          try {
            const deal = await closeDealLost({
              dealId: openDeal.id,
              userId: input.userId,
            });
            result = {
              workPackageId: TENANT_OPS_CLOSE_LOST_ID,
              version: TENANT_OPS_CLOSE_LOST_VERSION,
              itemId,
              organizationId,
              customerId: opportunity.customerId,
              entityId: opportunity.id,
              stage: "LOST",
              dealId: deal.id,
              dealStatus: deal.status,
              reused: false,
              action: "close-lost",
              result: "SUCCESS",
              executed: true,
              reason: "deal-closed-lost",
            };
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "close-lost-failed";
            result = failed({
              itemId,
              organizationId,
              entityId,
              customerId: opportunity.customerId,
              stage,
              dealId: openDeal.id,
              dealStatus: openDeal.status,
              reason: message,
            });
          }
        }
      }
    }
  }

  await auditCloseLostBoundary(result, input.userId);
  return result;
}
