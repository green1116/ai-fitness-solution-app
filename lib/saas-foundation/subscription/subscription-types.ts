export interface SaasSubscriptionRecord {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}
