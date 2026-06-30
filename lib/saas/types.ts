/**
 * V59 SaaS — Domain types (aligned with Prisma schema)
 */

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
