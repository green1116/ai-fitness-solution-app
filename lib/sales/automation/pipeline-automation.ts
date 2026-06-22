/**
 * V60 P3 — Pipeline automation (CRM integration — read/write via CRM services only)
 */

import { advanceLeadToOpportunity, advanceOpportunityToProposal } from "@/lib/crm/pipeline/crm.pipeline.engine";
import { createOpportunity, updateOpportunityStage } from "@/lib/crm/opportunity/opportunity.service";
import { scoreLeadById } from "@/lib/crm/lead/lead.service";
import { logCRMActivity } from "@/lib/crm/activity/activity.tracker";
import { evaluateStageAutomation } from "./stage-automation";
import { countSignal } from "../sales.events.store";
import { markHotDeal } from "../signals/sales.signal.engine";

export type PipelineAutomationResult = {
  automated: boolean;
  actions: string[];
  opportunityId?: string;
  stage?: string;
};

export async function autoCreateOpportunityIfQualified(input: {
  organizationId: string;
  customerId: string;
  leadId: string;
  leadScore: number;
  userId?: string;
}): Promise<PipelineAutomationResult> {
  const actions: string[] = [];

  if (input.leadScore <= 70) {
    return { automated: false, actions: ["lead_score_below_threshold"] };
  }

  try {
    const { opportunity } = await advanceLeadToOpportunity({
      leadId: input.leadId,
      value: input.leadScore * 100,
      userId: input.userId,
    });
    if (!opportunity) {
      actions.push("opportunity_create_no_result");
      return { automated: false, actions };
    }
    actions.push("auto_create_opportunity");

    await logCRMActivity({
      customerId: input.customerId,
      type: "sales.touchpoint",
      meta: { automation: "auto_create_opportunity", leadScore: input.leadScore },
    });

    return {
      automated: true,
      actions,
      opportunityId: opportunity.id,
      stage: opportunity.stage,
    };
  } catch (err) {
    actions.push(`opportunity_create_skipped:${err instanceof Error ? err.message : "unknown"}`);
    return { automated: false, actions };
  }
}

export async function autoAdvancePipeline(input: {
  organizationId: string;
  customerId: string;
  leadId?: string;
  opportunityId?: string;
  leadScore?: number;
  userId?: string;
}): Promise<PipelineAutomationResult> {
  const actions: string[] = [];
  const leadScore = input.leadScore ?? 0;
  const budgetViews = countSignal(input.organizationId, "budget.viewed", input.customerId);
  const tenderGenerated = countSignal(input.organizationId, "tender.generated", input.customerId) > 0;

  if (input.leadId && leadScore > 70) {
    const created = await autoCreateOpportunityIfQualified({
      organizationId: input.organizationId,
      customerId: input.customerId,
      leadId: input.leadId,
      leadScore,
      userId: input.userId,
    });
    if (created.automated) {
      actions.push(...created.actions);
      input.opportunityId = created.opportunityId;
    }
  }

  if (tenderGenerated) {
    markHotDeal({ organizationId: input.organizationId, customerId: input.customerId });
    actions.push("mark_as_hot_deal");
  }

  if (!input.opportunityId) {
    return { automated: actions.length > 0, actions };
  }

  const stageEval = evaluateStageAutomation({
    leadScore,
    budgetViews,
    tenderGenerated,
    currentStage: "INIT",
  });

  if (stageEval.shouldAdvance && stageEval.targetStage) {
    if (stageEval.targetStage === "PROPOSAL") {
      await advanceOpportunityToProposal(input.opportunityId, input.userId);
      actions.push("auto_advance_proposal");
    } else {
      await updateOpportunityStage({
        opportunityId: input.opportunityId,
        stage: stageEval.targetStage,
        userId: input.userId,
      });
      actions.push(`auto_advance_${stageEval.targetStage.toLowerCase()}`);
    }

    return {
      automated: true,
      actions,
      opportunityId: input.opportunityId,
      stage: stageEval.targetStage,
    };
  }

  return { automated: actions.length > 0, actions, opportunityId: input.opportunityId };
}

export async function runPipelineAutomationForLead(input: {
  organizationId: string;
  customerId: string;
  leadId: string;
  userId?: string;
}) {
  const lead = await scoreLeadById(input.leadId, {
    source: "sales_automation",
    hasQuote: countSignal(input.organizationId, "quote.generated", input.customerId) > 0,
    engagementCount: countSignal(input.organizationId, "budget.viewed", input.customerId),
  });

  return autoAdvancePipeline({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadId: input.leadId,
    leadScore: lead.score,
    userId: input.userId,
  });
}
