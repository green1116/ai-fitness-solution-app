import type { SaasPortalType, SaasTenantStatus } from "../shared/types";

export interface SaasTenantRecord {
  id: string;
  slug: string;
  name: string;
  status: SaasTenantStatus;
  portalType: SaasPortalType;
}
