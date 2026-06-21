/**
 * V62 P2 — Sales executor (delegates to V60 sales engine)
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import { runSalesAutomation, recommendNextAction } from "@/lib/sales/sales.service";
import { autoCreateOpportunityIfQualified } from "@/lib/sales/automation/pipeline-automation";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { recordQuoteSignal } from "@/lib/sales/signals/sales.signal.engine";

const DELEGATE = "lib/sales";

export async function autoTriggerOpportunity(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const payload = action.payload as {
    customerId?: string;
    leadId?: string;
    leadScore?: number;
    userId?: string;
  };

  if (!payload.customerId || !payload.leadId) {
    return {
      actionId: action.id,
      type: "SALES",
      status: "skipped",
      message: "Opportunity automation scheduled — customerId/leadId required for full execution",
      targetSystem: "V60",
      delegatedTo: `${DELEGATE}/automation/pipeline-automation`,
      traceId,
      reversible: false,
      executedAt: new Date().toISOString(),
    };
  }

  const result = await autoCreateOpportunityIfQualified({
    organizationId: action.organizationId,
    customerId: payload.customerId,
    leadId: payload.leadId,
    leadScore: payload.leadScore ?? 85,
    userId: payload.userId,
  });

  return {
    actionId: action.id,
    type: "SALES",
    status: result.automated ? "executed" : "skipped",
    message: result.actions.join(", "),
    targetSystem: "V60",
    delegatedTo: `${DELEGATE}/automation/pipeline-automation`,
    traceId,
    reversible: false,
    executedAt: new Date().toISOString(),
  };
}

export async function autoSendProposalReminder(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const payload = action.payload as { customerId?: string };
  const suggestion = recommendNextAction({
    organizationId: action.organizationId,
    customerId: payload.customerId,
  });

  appendGrowthEvent({
    event: "execution.proposal_reminder",
    organizationId: action.organizationId,
    meta: { actionId: action.id, cta: suggestion.cta, reason: suggestion.reason },
  });

  return {
    actionId: action.id,
    type: "SALES",
    status: "executed",
    message: `${suggestion.action}: ${suggestion.reason}`,
    targetSystem: "V60",
    delegatedTo: `${DELEGATE}/ai/sales-ai.engine`,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function executeSalesAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const op = String((action.payload as { operation?: string })?.operation ?? "automate");

  if (op === "opportunity" || op === "auto_opportunity") {
    return autoTriggerOpportunity(action, traceId);
  }

  if (op === "reminder" || op === "proposal_reminder") {
    return autoSendProposalReminder(action, traceId);
  }

  const customerId = String((action.payload as { customerId?: string })?.customerId ?? "").trim();
  if (customerId) {
    await runSalesAutomation({
      organizationId: action.organizationId,
      customerId,
      leadId: (action.payload as { leadId?: string })?.leadId,
      opportunityId: (action.payload as { opportunityId?: string })?.opportunityId,
    });
    recordQuoteSignal({ organizationId: action.organizationId, customerId });
    return {
      actionId: action.id,
      type: "SALES",
      status: "executed",
      message: "Sales automation executed via V60",
      targetSystem: "V60",
      delegatedTo: `${DELEGATE}/sales.service`,
      traceId,
      reversible: false,
      executedAt: new Date().toISOString(),
    };
  }

  return autoSendProposalReminder(action, traceId);
}
