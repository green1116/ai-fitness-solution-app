import type { SaasMembershipStatus } from "../shared/types";

export interface SaasMembershipRecord {
  id: string;
  tenantId: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
  roleId: string;
  status: SaasMembershipStatus;
}
