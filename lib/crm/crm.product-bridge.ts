/**
 * V60 P2 — Product → CRM bridge (Quote→Lead, Budget→Opportunity, Tender→Deal)
 *
 * Non-blocking: failures are logged but do not affect product APIs or feature gates.
 */

import { findOrCreateCustomer } from "./customer/customer.service";
import { createLead, promoteLeadToOpportunity } from "./lead/lead.service";
import { createOpportunity, updateOpportunityStage } from "./opportunity/opportunity.service";
import { createDeal } from "./deal/deal.service";
import { logProductActivity } from "./activity/activity.tracker";
import { scoreLead } from "./lead/lead.scoring";
import { calculateDealValue } from "./deal/deal.value";

export async function recordQuoteAsLead(input: {
  organizationId: string;
  companyName: string;
  industry?: string;
  userId?: string;
  quoteId?: string;
  projectId?: string;
}) {
  try {
    const customer = await findOrCreateCustomer({
      organizationId: input.organizationId,
      name: input.companyName,
      industry: input.industry,
      userId: input.userId,
    });

    const leadScore = scoreLead({
      source: "quote_generation",
      hasQuote: true,
      hasProject: Boolean(input.projectId),
    });

    const lead = await createLead({
      customerId: customer.id,
      source: "quote_generation",
      score: leadScore,
      userId: input.userId,
    });

    await logProductActivity({
      customerId: customer.id,
      product: "quote",
      resourceId: input.quoteId,
      userId: input.userId,
      organizationId: input.organizationId,
    });

    return { customer, lead };
  } catch (err) {
    console.error("[crm/quote-lead]", err);
    return null;
  }
}

export async function recordBudgetAsOpportunity(input: {
  organizationId: string;
  companyName: string;
  userId?: string;
  quoteId?: string;
  budgetId?: string;
  estimatedValue?: number;
}) {
  try {
    const customer = await findOrCreateCustomer({
      organizationId: input.organizationId,
      name: input.companyName || "Budget Customer",
      userId: input.userId,
    });

    const leads = await createLead({
      customerId: customer.id,
      source: "budget_calculation",
      score: scoreLead({ source: "budget_calculation", hasQuote: true }),
      userId: input.userId,
    });

    let opportunity;
    if (leads.status === "QUALIFIED" || leads.score >= 50) {
      const promoted = await promoteLeadToOpportunity({
        leadId: leads.id,
        value: input.estimatedValue ?? 5000,
        userId: input.userId,
      });
      opportunity = promoted.opportunity;
      await updateOpportunityStage({
        opportunityId: opportunity.id,
        stage: "PROPOSAL",
        userId: input.userId,
      });
    } else {
      opportunity = await createOpportunity({
        customerId: customer.id,
        leadId: leads.id,
        stage: "INIT",
        value: input.estimatedValue ?? 5000,
        userId: input.userId,
      });
    }

    await logProductActivity({
      customerId: customer.id,
      product: "budget",
      resourceId: input.budgetId,
      userId: input.userId,
      organizationId: input.organizationId,
    });

    return { customer, opportunity };
  } catch (err) {
    console.error("[crm/budget-opportunity]", err);
    return null;
  }
}

export async function recordTenderAsDeal(input: {
  organizationId: string;
  companyName: string;
  userId?: string;
  tenderId?: string;
  estimatedValue?: number;
}) {
  try {
    const customer = await findOrCreateCustomer({
      organizationId: input.organizationId,
      name: input.companyName || "Tender Customer",
      userId: input.userId,
    });

    const opportunity = await createOpportunity({
      customerId: customer.id,
      stage: "NEGOTIATION",
      value: input.estimatedValue ?? 10000,
      userId: input.userId,
    });

    const amount = calculateDealValue({
      opportunity,
      amount: input.estimatedValue,
    });

    const deal = await createDeal({
      opportunityId: opportunity.id,
      amount,
      userId: input.userId,
    });

    await logProductActivity({
      customerId: customer.id,
      product: "tender",
      resourceId: input.tenderId,
      userId: input.userId,
      organizationId: input.organizationId,
    });

    return { customer, opportunity, deal };
  } catch (err) {
    console.error("[crm/tender-deal]", err);
    return null;
  }
}
