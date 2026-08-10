/**
 * V60 P2 — CRM domain types & Prisma delegate accessor
 */

import { prisma } from "@/lib/prisma";

export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type LeadStatus = "NEW" | "QUALIFIED" | "LOST";
export type OpportunityStage = "INIT" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type DealStatus = "OPEN" | "CLOSED_WON" | "CLOSED_LOST";

export type CustomerRow = {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadRow = {
  id: string;
  customerId: string;
  source: string;
  score: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OpportunityRow = {
  id: string;
  customerId: string;
  leadId: string | null;
  stage: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DealRow = {
  id: string;
  opportunityId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CRMActivityRow = {
  id: string;
  customerId: string;
  type: string;
  meta: unknown;
  timestamp: Date;
};

export interface CRMMetrics {
  totalCustomers: number;
  totalLeads: number;
  qualifiedLeads: number;
  opportunities: number;
  dealsWon: number;
  revenue: number;
}

type CrmPrismaDelegates = {
  customer: {
    create: (args: {
      data: { organizationId: string; name: string; industry?: string; status?: string };
    }) => Promise<CustomerRow>;
    findMany: (args: {
      where: { organizationId: string };
      orderBy?: { createdAt: "desc" | "asc" };
      take?: number;
    }) => Promise<CustomerRow[]>;
    findFirst: (args: {
      where: { id?: string; organizationId?: string; name?: string };
    }) => Promise<CustomerRow | null>;
    update: (args: {
      where: { id: string };
      data: Partial<Pick<CustomerRow, "name" | "industry" | "status">>;
    }) => Promise<CustomerRow>;
    count: (args: { where: { organizationId: string } }) => Promise<number>;
  };
  crmLead: {
    create: (args: {
      data: { customerId: string; source?: string; score?: number; status?: string };
    }) => Promise<LeadRow>;
    findMany: (args: { where: { customerId?: string; status?: string } }) => Promise<LeadRow[]>;
    findFirst: (args: { where: { id?: string; customerId?: string } }) => Promise<LeadRow | null>;
    update: (args: {
      where: { id: string };
      data: Partial<Pick<LeadRow, "score" | "status" | "source">>;
    }) => Promise<LeadRow>;
    count: (args: { where: { status?: string; customer?: { organizationId: string } } }) => Promise<number>;
  };
  opportunity: {
    create: (args: {
      data: { customerId: string; leadId?: string; stage?: string; value?: number };
    }) => Promise<OpportunityRow>;
    findMany: (args: { where: { customerId?: string; stage?: string } }) => Promise<OpportunityRow[]>;
    findFirst: (args: { where: { id?: string; customerId?: string } }) => Promise<OpportunityRow | null>;
    update: (args: {
      where: { id: string };
      data: Partial<Pick<OpportunityRow, "stage" | "value" | "leadId">>;
    }) => Promise<OpportunityRow>;
    count: (args: { where: { stage?: string; customer?: { organizationId: string } } }) => Promise<number>;
  };
  deal: {
    create: (args: {
      data: { opportunityId: string; amount?: number; status?: string };
    }) => Promise<DealRow>;
    findMany: (args: { where: { opportunityId?: string; status?: string } }) => Promise<DealRow[]>;
    findFirst: (args: { where: { id?: string; opportunityId?: string } }) => Promise<DealRow | null>;
    update: (args: {
      where: { id: string };
      data: Partial<Pick<DealRow, "amount" | "status">>;
    }) => Promise<DealRow>;
    count: (args: { where: { status?: string } }) => Promise<number>;
  };
  cRMActivity: {
    create: (args: {
      data: { customerId: string; type: string; meta?: unknown };
    }) => Promise<CRMActivityRow>;
    findMany: (args: {
      where: { customerId: string };
      orderBy?: { timestamp: "desc" | "asc" };
      take?: number;
    }) => Promise<CRMActivityRow[]>;
    count: (args: { where: { customerId?: string } }) => Promise<number>;
  };
};

export function crmDb(): CrmPrismaDelegates {
  return prisma as unknown as CrmPrismaDelegates;
}
