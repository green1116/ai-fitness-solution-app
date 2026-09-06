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
import {
  appendTenantOpsAudit,
  toTenantOpsAuditResult,
} from "@/lib/runtime-ops/tenant-ops-audit";

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

function executeActionForTarget(toStage: TenantOpsExecuteTargetStage): string {
  return toStage === "PROPOSAL" ? "prepare-proposal" : "advance-proposal";
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

async function auditExecuteBoundary(
  result: TenantOpsExecuteActionResult,
  userId?: string,
): Promise<void> {
  await appendTenantOpsAudit({
    kind: "execute",
    organizationId: result.organizationId,
    userId,
    itemId: result.itemId,
    customerId: result.customerId,
    action: result.action ?? "execute",
    result: toTenantOpsAuditResult(result.result),
    reason: result.reason,
  });
}

/**
 * Advance Opportunity stage via existing CRM pipeline helpers.
 * Does not open deals; does not call EWEB/EWER.
 * Re-reads stage immediately before mutate; already-at-target → SUCCESS idempotent.
 */
export async function runTenantOpsExecuteAction(input: {
  organizationId: string;
  itemId: string;
  userId?: string;
}): Promise<TenantOpsExecuteActionResult> {
  const organizationId = input.organizationId.trim();
  const itemId = input.itemId.trim();

  let result: TenantOpsExecuteActionResult;

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
          fromStage: opportunity.stage,
          reason: "organization-mismatch",
        });
      } else {
        const fromStage = opportunity.stage.trim().toUpperCase();
        const toStage = deriveTenantOpsExecuteTarget(fromStage);

        if (!toStage) {
          result = failed({
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
        } else {
          const action = executeActionForTarget(toStage);

          // Re-read immediately before mutation — authority for idempotency.
          const live = await prisma.opportunity.findUnique({
            where: { id: entityId },
            select: { stage: true },
          });
          if (!live) {
            result = failed({
              itemId,
              organizationId,
              entityId,
              customerId: opportunity.customerId,
              fromStage,
              toStage,
              action,
              reason: "opportunity-not-found",
            });
          } else {
            const liveStage = live.stage.trim().toUpperCase();

            if (liveStage === toStage) {
              result = {
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
                executed: false,
                reason: "idempotent",
              };
            } else if (liveStage !== fromStage) {
              result = failed({
                itemId,
                organizationId,
                entityId,
                customerId: opportunity.customerId,
                fromStage: liveStage,
                toStage,
                action,
                result: "BLOCKED",
                executed: false,
                reason: "stage-changed",
              });
            } else if (
              !(
                (fromStage === "INIT" && toStage === "PROPOSAL") ||
                (fromStage === "PROPOSAL" && toStage === "NEGOTIATION")
              )
            ) {
              result = failed({
                itemId,
                organizationId,
                entityId,
                customerId: opportunity.customerId,
                fromStage,
                toStage,
                action,
                result: "BLOCKED",
                executed: false,
                reason: "not-executable",
              });
            } else {
              try {
                if (toStage === "PROPOSAL") {
                  await advanceOpportunityToProposal(entityId, input.userId);
                } else {
                  await advanceOpportunityToNegotiation(
                    entityId,
                    input.userId,
                  );
                }
                result = {
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
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "execute-failed";
                result = failed({
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
            }
          }
        }
      }
    }
  }

  await auditExecuteBoundary(result, input.userId);
  return result;
}
