/**
 * V59 SaaS — Domain types (aligned with Prisma schema; decoupled from client generate timing)
 */

import { prisma } from "@/lib/prisma";

export type SaasPlan = "BASIC" | "PRO" | "ENTERPRISE";
export type SaasSubStatus = "ACTIVE" | "CANCELED";
export type UsageType = "QUOTE" | "BUDGET" | "TENDER" | "PDF";

export type SubscriptionRecord = {
  id: string;
  organizationId: string;
  plan: SaasPlan;
  status: SaasSubStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentRow = {
  id: string;
  organizationId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StripeWebhookEventRow = {
  stripeEventId: string;
  eventType: string;
  processedAt: Date;
};

export type UsageRecordRow = {
  id: string;
  organizationId: string;
  type: UsageType;
  count: number;
  createdAt: Date;
};

export type SaasInvoiceRow = {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Prisma delegate accessors (schema-defined; regenerate client when EPERM clears) */
type SaasPrismaDelegates = {
  subscription: {
    create: (args: {
      data: {
        organizationId: string;
        plan?: SaasPlan;
        status?: SaasSubStatus;
        stripeCustomerId?: string | null;
        stripeSubscriptionId?: string | null;
        currentPeriodEnd?: Date | null;
      };
    }) => Promise<SubscriptionRecord>;
    findFirst: (args: {
      where: { organizationId: string; status?: SaasSubStatus };
      orderBy?: { createdAt: "desc" | "asc" };
    }) => Promise<SubscriptionRecord | null>;
    update: (args: {
      where: { id: string };
      data: Partial<
        Pick<
          SubscriptionRecord,
          "status" | "plan" | "stripeCustomerId" | "stripeSubscriptionId" | "currentPeriodEnd"
        >
      >;
    }) => Promise<SubscriptionRecord>;
    findByStripeCustomerId: (stripeCustomerId: string) => Promise<SubscriptionRecord | null>;
    findByStripeSubscriptionId: (stripeSubscriptionId: string) => Promise<SubscriptionRecord | null>;
  };
  payment: {
    create: (args: {
      data: {
        organizationId: string;
        stripeSessionId: string;
        amount: number;
        currency?: string;
        status?: string;
      };
    }) => Promise<PaymentRow>;
    update: (args: {
      where: { stripeSessionId: string };
      data: { status: string };
    }) => Promise<PaymentRow>;
    findBySessionId: (stripeSessionId: string) => Promise<PaymentRow | null>;
  };
  stripeWebhookEvent: {
    exists: (stripeEventId: string) => Promise<boolean>;
    create: (args: { data: { stripeEventId: string; eventType: string } }) => Promise<StripeWebhookEventRow>;
  };
  usageRecord: {
    create: (args: {
      data: { organizationId: string; type: UsageType; count?: number };
    }) => Promise<UsageRecordRow>;
    aggregate: (args: {
      where: { organizationId: string; type: UsageType; createdAt?: { gte: Date } };
      _sum: { count: true };
    }) => Promise<{ _sum: { count: number | null } }>;
  };
  saasInvoice: {
    create: (args: {
      data: {
        organizationId: string;
        subscriptionId?: string;
        amount: number;
        currency?: string;
        status?: string;
        stripeInvoiceId?: string;
      };
    }) => Promise<SaasInvoiceRow>;
    update: (args: { where: { id: string }; data: { status: string } }) => Promise<SaasInvoiceRow>;
    findMany: (args: {
      where: { organizationId: string };
      orderBy: { createdAt: "desc" };
      take: number;
    }) => Promise<SaasInvoiceRow[]>;
  };
};

export function saasDb(): SaasPrismaDelegates {
  return prisma as unknown as SaasPrismaDelegates;
}
