import type { SaasPortalType } from "../shared/types";

export interface SaasOrganizationRecord {
  id: string;
  tenantId: string;
  name: string;
  orgType: SaasPortalType | "brand";
  status: string;
}
