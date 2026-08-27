/**
 * V60 P2 — Product → CRM bridge (Quote→Lead, Budget→Opportunity, Tender→Deal)
 *
 * Non-blocking: failures are logged but do not affect product APIs or feature gates.
 */

import { getCurrentUser } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/prisma";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import { findOrCreateCustomer } from "./customer/customer.service";
import {
  createLead,
  findOrCreateConsultationLeadByMarketingId,
  promoteLeadToOpportunity,
} from "./lead/lead.service";
import { createOpportunity, updateOpportunityStage } from "./opportunity/opportunity.service";
import { createDeal } from "./deal/deal.service";
import { logProductActivity } from "./activity/activity.tracker";
import { scoreLead } from "./lead/lead.scoring";
import { calculateDealValue } from "./deal/deal.value";
import { getLatestBudgetForProject } from "@/lib/services/budget.service";

const BUDGET_CUSTOMER_FALLBACK = "Budget Customer";
const TENDER_CUSTOMER_FALLBACK = "Tender Customer";

function readCompanyNameFromQuoteInfo(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return String((value as { companyName?: unknown }).companyName ?? "").trim();
}

async function resolveCompanyNameFromQuoteOrProject(input: {
  companyName?: string;
  quoteId?: string;
  projectId?: string;
  fallback: string;
}): Promise<string> {
  const provided = (input.companyName || "").trim();
  const isSentinel =
    provided === BUDGET_CUSTOMER_FALLBACK ||
    provided === TENDER_CUSTOMER_FALLBACK;

  if (input.quoteId) {
    const quote = await prisma.quote.findUnique({
      where: { id: input.quoteId },
      select: {
        companyInfo: true,
        project: { select: { clientName: true } },
      },
    });
    const fromQuote = readCompanyNameFromQuoteInfo(quote?.companyInfo);
    if (fromQuote) return fromQuote;
    const fromProject = (quote?.project?.clientName || "").trim();
    if (fromProject) return fromProject;
  }

  if (input.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: { clientName: true },
    });
    const fromProject = (project?.clientName || "").trim();
    if (fromProject) return fromProject;
  }

  if (provided && !isSentinel) return provided;
  return input.fallback;
}

async function resolveCrmBridgeContext(planId?: string) {
  const user = await getCurrentUser();
  let userId: string | undefined;
  let organizationId: string | undefined;

  if (user) {
    userId = user.id;
    const existing = await listOrganizationsForUser(user.id);
    organizationId =
      existing[0]?.organization.id ??
      (
        await ensureOrganizationForUser({
          userId: user.id,
          name: user.name ?? undefined,
        })
      ).id;
  }

  const pid = (planId || "").trim();
  if (!organizationId && pid) {
    const project = await prisma.project.findUnique({
      where: { id: pid },
      select: { organizationId: true },
    });
    organizationId = project?.organizationId ?? undefined;
  }

  return { userId, organizationId };
}

async function resolveConsultOpportunityValue(planId: string): Promise<number | undefined> {
  const pid = (planId || "").trim();
  if (!pid) return undefined;

  const project = await prisma.project.findUnique({
    where: { id: pid },
    select: { id: true },
  });
  if (!project) return undefined;

  const budget = await getLatestBudgetForProject(project.id);
  if (!budget) return undefined;

  const min = Number(budget.totalEstimateMin);
  const max = Number(budget.totalEstimateMax);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

  const midpoint = (min + max) / 2;
  if (midpoint <= 0) return undefined;

  return midpoint;
}

export async function recordEnterpriseConsultationAsLead(input: {
  marketingLeadId: string;
  planId: string;
  company: string;
  email: string;
}) {
  try {
    const { userId, organizationId } = await resolveCrmBridgeContext(input.planId);
    if (!organizationId) {
      console.warn("[crm/enterprise-consultation-lead] missing organizationId", {
        planId: input.planId,
        marketingLeadId: input.marketingLeadId,
      });
      return null;
    }

    const customer = await findOrCreateCustomer({
      organizationId,
      name: input.company,
      userId,
    });

    const leadScore = scoreLead({ source: "enterprise_consultation" });

    const lead = await findOrCreateConsultationLeadByMarketingId({
      customerId: customer.id,
      organizationId,
      marketingLeadId: input.marketingLeadId,
      email: input.email,
      planId: input.planId,
      userId,
      score: leadScore,
    });

    let opportunity;
    if (lead.status === "QUALIFIED" || lead.score >= 50) {
      const consultValue = await resolveConsultOpportunityValue(input.planId);
      const promoted = await promoteLeadToOpportunity({
        leadId: lead.id,
        userId,
        value: consultValue ?? 0,
      });
      opportunity = promoted.opportunity;
    }

    return { customer, lead, opportunity };
  } catch (err) {
    console.error("[crm/enterprise-consultation-lead]", err);
    return null;
  }
}

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
    const companyName = await resolveCompanyNameFromQuoteOrProject({
      companyName: input.companyName,
      quoteId: input.quoteId,
      fallback: BUDGET_CUSTOMER_FALLBACK,
    });

    const customer = await findOrCreateCustomer({
      organizationId: input.organizationId,
      name: companyName,
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
  quoteId?: string;
  projectId?: string;
  estimatedValue?: number;
}) {
  try {
    const companyName = await resolveCompanyNameFromQuoteOrProject({
      companyName: input.companyName,
      quoteId: input.quoteId,
      projectId: input.projectId,
      fallback: TENDER_CUSTOMER_FALLBACK,
    });

    const customer = await findOrCreateCustomer({
      organizationId: input.organizationId,
      name: companyName,
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
