export interface BootstrapTenantInput {
  userId: string;
  tenantName: string;
  organizationName: string;
  workspaceName: string;
  portalType?: string;
}

export interface BootstrapTenantResult {
  tenantId: string;
  organizationId: string;
  workspaceId: string;
  membershipId: string;
  subscriptionId: string;
}

export interface CreateTenantInput {
  name: string;
  portalType?: string;
  status?: string;
}

export interface CreateOrganizationInput {
  tenantId: string;
  name: string;
  orgType?: string;
}

export interface CreateWorkspaceInput {
  tenantId: string;
  organizationId: string;
  name: string;
  workspaceType?: string;
}

export interface CreateOwnerMembershipInput {
  tenantId: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
}

export interface BootstrapTrialSubscriptionInput {
  tenantId: string;
}
