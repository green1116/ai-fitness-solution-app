export interface SaasEntitlementGrantRecord {
  id: string;
  tenantId: string;
  feature: string;
  enabled: boolean;
  quota: number | null;
  used: number;
}
