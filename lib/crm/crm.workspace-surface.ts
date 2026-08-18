/**
 * CRM Workspace Surface — read-only assembler for operator visibility.
 * Org-scoped, deterministic, reuses existing CRM read services.
 */

import { listCustomers } from "./customer/customer.service";
import { listLeadsForCustomer } from "./lead/lead.service";
import { listOpportunitiesForCustomer } from "./opportunity/opportunity.service";
import { listDealsForOpportunity } from "./deal/deal.service";

export type CrmWorkItem = Readonly<{
  id: string;
  customerId: string;
  customerName: string;
  entity: "lead" | "opportunity" | "deal";
  entityId: string;
  status: string;
  score?: number;
  stage?: string;
  amount?: number;
  label: string;
}>;

export type CrmWorkSurface = Readonly<{
  items: readonly CrmWorkItem[];
  qualifiedLeads: number;
  activeOpportunities: number;
  openDeals: number;
}>;

const TERMINAL_OPPORTUNITY_STAGES = new Set(["WON", "LOST"]);

export async function assembleCrmWorkSurface(
  organizationId: string,
): Promise<CrmWorkSurface> {
  const customers = await listCustomers(organizationId);
  const items: CrmWorkItem[] = [];

  for (const customer of customers) {
    const leads = await listLeadsForCustomer(customer.id);
    for (const lead of leads) {
      if (lead.status !== "QUALIFIED") continue;
      items.push({
        id: `crm:lead:${lead.id}`,
        customerId: customer.id,
        customerName: customer.name,
        entity: "lead",
        entityId: lead.id,
        status: lead.status,
        score: lead.score,
        label: `${customer.name} · Lead QUALIFIED · score ${lead.score} · ${lead.source}`,
      });
    }

    const opportunities = await listOpportunitiesForCustomer(customer.id);
    for (const opp of opportunities) {
      if (TERMINAL_OPPORTUNITY_STAGES.has(opp.stage)) continue;
      items.push({
        id: `crm:opp:${opp.id}`,
        customerId: customer.id,
        customerName: customer.name,
        entity: "opportunity",
        entityId: opp.id,
        status: opp.stage,
        stage: opp.stage,
        label: `${customer.name} · Opportunity ${opp.stage} · ¥${opp.value}`,
      });

      const deals = await listDealsForOpportunity(opp.id);
      for (const deal of deals) {
        if (deal.status !== "OPEN") continue;
        items.push({
          id: `crm:deal:${deal.id}`,
          customerId: customer.id,
          customerName: customer.name,
          entity: "deal",
          entityId: deal.id,
          status: deal.status,
          amount: deal.amount,
          label: `${customer.name} · Deal OPEN · ¥${deal.amount}`,
        });
      }
    }
  }

  return {
    items,
    qualifiedLeads: items.filter((i) => i.entity === "lead").length,
    activeOpportunities: items.filter((i) => i.entity === "opportunity").length,
    openDeals: items.filter((i) => i.entity === "deal").length,
  };
}
