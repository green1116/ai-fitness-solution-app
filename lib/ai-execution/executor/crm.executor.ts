/**
 * V62 P2 — CRM executor (delegates to V60 CRM services)
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import { buildReactivationCampaign } from "@/lib/growth/retention/reactivation.engine";
import { markHotDeal } from "@/lib/sales/signals/sales.signal.engine";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { updateCustomerLifecycle } from "@/lib/crm/customer/customer.lifecycle";

const DELEGATE = "lib/crm";

export async function triggerReactivationFlow(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const campaign = buildReactivationCampaign(action.organizationId);
  const customerId = String((action.payload as { customerId?: string })?.customerId ?? "");

  if (customerId) {
    try {
      await updateCustomerLifecycle({
        customerId,
        organizationId: action.organizationId,
        stage: "churn_risk",
      });
    } catch {
      appendGrowthEvent({
        event: "execution.crm_reactivation",
        organizationId: action.organizationId,
        meta: { actionId: action.id, customerId, fallback: true },
      });
    }
  } else {
    appendGrowthEvent({
      event: "execution.crm_reactivation",
      organizationId: action.organizationId,
      meta: { actionId: action.id, message: campaign.message },
    });
  }

  return {
    actionId: action.id,
    type: "CRM",
    status: "executed",
    message: `Reactivation flow: ${campaign.message}`,
    targetSystem: "V60",
    delegatedTo: `${DELEGATE}/customer/customer.lifecycle`,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function escalateDealPriority(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const payload = action.payload as { customerId?: string; dealId?: string };
  const customerId = payload.customerId ?? action.organizationId;

  markHotDeal({
    organizationId: action.organizationId,
    customerId,
    dealId: payload.dealId,
  });

  return {
    actionId: action.id,
    type: "CRM",
    status: "executed",
    message: "Hot deal priority escalated via V60 sales signals",
    targetSystem: "V60",
    delegatedTo: "lib/sales/signals/sales.signal.engine",
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function executeCRMAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const op = String((action.payload as { operation?: string })?.operation ?? "reactivation");

  if (op === "escalate" || op === "hot_deal") {
    return escalateDealPriority(action, traceId);
  }

  return triggerReactivationFlow(action, traceId);
}
