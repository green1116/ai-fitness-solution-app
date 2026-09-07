/**
 * WP-RUNTIME-OPS-TENANT-CLOSE-WON-1
 * Tenant-scoped close-won for NEGOTIATION opportunities with an OPEN deal.
 * Uses closeDealWon only — no closeDealLost.
 */

import { closeDealWon } from "@/lib/crm/deal/deal.service";
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

export const TENANT_OPS_CLOSE_WON_ID = "tenant-ops-close-won-1" as const;
export const TENANT_OPS_CLOSE_WON_VERSION =
  "runtime-ops-tenant-close-won-1" as const;

export type TenantOpsCloseWonResultKind = "SUCCESS" | "BLOCKED" | "FAILED";

export type TenantOpsCloseWonResult = Readonly<{
  workPackageId: typeof TENANT_OPS_CLOSE_WON_ID;
  version: typeof TENANT_OPS_CLOSE_WON_VERSION;
  itemId: string;
  organizationId: string;
  customerId: string | null;
  entityId: string | null;
  stage: string | null;
  dealId: string | null;
  dealStatus: string | null;
  reused: boolean;
  action: "close-won";
  result: TenantOpsCloseWonResultKind;
  executed: boolean;
  reason: string;
  failureClass?: TenantOpsFailureClass;
}>;

/** UI / primary gate: close-won is offered for NEGOTIATION only. */
export function isTenantOpsCloseWonEligible(stage: string): boolean {
  return stage.trim().toUpperCase() === "NEGOTIATION";
}

function failed(
  partial: Pick<TenantOpsCloseWonResult, "itemId" | "organizationId"> &
    Partial<
      Omit<
        TenantOpsCloseWonResult,
        "workPackageId" | "version" | "itemId" | "organizationId" | "action"
      >
    >,
): TenantOpsCloseWonResult {
  const result = partial.result ?? "FAILED";
  const reason = partial.reason ?? "failed";
  return {
    workPackageId: TENANT_OPS_CLOSE_WON_ID,
    version: TENANT_OPS_CLOSE_WON_VERSION,
    itemId: partial.itemId,
    organizationId: partial.organizationId,
    customerId: partial.customerId ?? null,
    entityId: partial.entityId ?? null,
    stage: partial.stage ?? null,
    dealId: partial.dealId ?? null,
    dealStatus: partial.dealStatus ?? null,
    reused: partial.reused ?? false,
    action: "close-won",
    result,
    executed: partial.executed ?? false,
    reason,
    failureClass: failureClassForOutcome(result, reason),
  };
}

async function auditCloseWonBoundary(
  result: TenantOpsCloseWonResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "close_won",
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
 * Close an OPEN deal as won for a NEGOTIATION opportunity.
 * CLOSED_WON + opportunity WON → idempotent SUCCESS.
 * Blocks CLOSED_LOST / cross-terminal / non-NEGOTIATION (except idempotent path).
 */
export async function runTenantOpsCloseWonAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsCloseWonResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsCloseWonResult;

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

        if (wonDeal && stage === "WON") {
          result = {
            workPackageId: TENANT_OPS_CLOSE_WON_ID,
            version: TENANT_OPS_CLOSE_WON_VERSION,
            itemId,
            organizationId,
            customerId: opportunity.customerId,
            entityId: opportunity.id,
            stage,
            dealId: wonDeal.id,
            dealStatus: wonDeal.status,
            reused: true,
            action: "close-won",
            result: "SUCCESS",
            executed: false,
            reason: "deal-already-closed-won",
          };
        } else if (lostDeal && !openDeal) {
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
            reason: "deal-closed-lost",
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
        } else if (!isTenantOpsCloseWonEligible(stage)) {
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
            reason: "not-close-won-eligible",
          });
        } else if (!openDeal) {
          result = failed({
            itemId,
            organizationId,
            entityId,
            customerId: opportunity.customerId,
            stage,
            dealId: wonDeal?.id ?? null,
            dealStatus: wonDeal?.status ?? null,
            result: "BLOCKED",
            executed: false,
            reason: wonDeal ? "deal-cross-terminal" : "no-open-deal",
          });
        } else {
          try {
            const deal = await closeDealWon({
              dealId: openDeal.id,
              userId: input.userId,
            });
            result = {
              workPackageId: TENANT_OPS_CLOSE_WON_ID,
              version: TENANT_OPS_CLOSE_WON_VERSION,
              itemId,
              organizationId,
              customerId: opportunity.customerId,
              entityId: opportunity.id,
              stage: "WON",
              dealId: deal.id,
              dealStatus: deal.status,
              reused: false,
              action: "close-won",
              result: "SUCCESS",
              executed: true,
              reason: "deal-closed-won",
            };
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "close-won-failed";
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

  await auditCloseWonBoundary(result, input.userId);
  return result;
}
