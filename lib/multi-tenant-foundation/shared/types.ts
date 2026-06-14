export const MULTI_TENANT_VERSION = "v29-multi-tenant-4" as const;
export const MULTI_TENANT_TAG = "v29-multi-tenant-foundation" as const;

export type MultiTenantDataMode = "multi-tenant";

export type MultiTenantStatus = "active" | "inactive" | "draft";

export type OrganizationType = "brand" | "supplier" | "tender-owner";

export interface Organization {
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  entityRef: string;
  status: MultiTenantStatus;
  mode: MultiTenantDataMode;
}

export interface Workspace {
  workspaceId: string;
  organizationId: string;
  workspaceName: string;
  workspaceType: OrganizationType;
  status: MultiTenantStatus;
  mode: MultiTenantDataMode;
}

export interface Membership {
  membershipId: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  status: MultiTenantStatus;
  mode: MultiTenantDataMode;
}

export interface Role {
  roleId: string;
  roleName: string;
  scope: OrganizationType;
  permissionIds: string[];
  mode: MultiTenantDataMode;
}

export interface Permission {
  permissionId: string;
  action: string;
  resource: string;
  description: string;
  mode: MultiTenantDataMode;
}

export interface MultiTenantValidation {
  valid: boolean;
  organizationExists: boolean;
  workspaceExists: boolean;
  membershipExists: boolean;
  roleExists: boolean;
  permissionExists: boolean;
  v26BrandCompatible: boolean;
  v27SupplierCompatible: boolean;
  v28TenderCompatible: boolean;
}

export interface MultiTenantReport {
  version: typeof MULTI_TENANT_VERSION;
  reportId: string;
  organizationCount: number;
  workspaceCount: number;
  membershipCount: number;
  roleCount: number;
  permissionCount: number;
  validation: MultiTenantValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_MULTI_TENANT_QUERY = {
  organizationId: "org-brand-life-fitness",
  workspaceId: "workspace-brand-life-fitness",
} as const;

export interface AccessRule {
  resourceType: string;
  action: string;
  role: string;
  allowed: boolean;
  mode: MultiTenantDataMode;
}

export type MembershipInvitationStatus = "pending" | "accepted" | "active" | "removed";

export const MEMBERSHIP_INVITATION_WORKFLOW_STATES = [
  "pending",
  "accepted",
  "active",
  "removed",
] as const;

export interface MembershipInvitation {
  invitationId: string;
  workspaceId: string;
  email: string;
  role: string;
  status: MembershipInvitationStatus;
  mode: MultiTenantDataMode;
}

export type CollaborationPermissionLevel = "read" | "write" | "admin";

export interface WorkspaceCollaboration {
  workspaceId: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  permissionLevel: CollaborationPermissionLevel;
  mode: MultiTenantDataMode;
}

export interface AccessControlValidation {
  valid: boolean;
  roleValid: boolean;
  permissionValid: boolean;
  resourceValid: boolean;
}

export interface MembershipWorkflowStep {
  status: MembershipInvitationStatus;
  completed: boolean;
  current: boolean;
}

export interface MembershipWorkflow {
  invitationId: string;
  workspaceId: string;
  email: string;
  currentStatus: MembershipInvitationStatus;
  steps: MembershipWorkflowStep[];
  nextStatus: MembershipInvitationStatus | null;
}

export interface WorkspaceCollaborationEntry {
  workspaceId: string;
  workspaceName: string;
  workspaceType: OrganizationType;
  memberCount: number;
  resourceCount: number;
  permissionCount: number;
  collaborationEnabled: boolean;
}

export interface CollaborationLayerValidation {
  valid: boolean;
  brandWorkspaceCollaboration: boolean;
  supplierWorkspaceCollaboration: boolean;
  tenderWorkspaceCollaboration: boolean;
  accessControlValid: boolean;
}

export interface WorkspaceCollaborationReport {
  version: typeof MULTI_TENANT_VERSION;
  reportId: string;
  workspaces: WorkspaceCollaborationEntry[];
  validation: CollaborationLayerValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_COLLABORATION_WORKSPACES = {
  brand: "workspace-brand-life-fitness",
  supplier: "workspace-supplier-life-fitness-cn",
  tender: "workspace-tender-owner-sh-gym",
} as const;

export interface MultiTenantCoverageStats {
  organizationCoverage: number;
  workspaceCoverage: number;
  membershipCoverage: number;
  roleCoverage: number;
  permissionCoverage: number;
  accessControlCoverage: number;
  collaborationCoverage: number;
  coverageScore: number;
}

export interface MultiTenantFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  workflowPathValid: boolean;
  validationScore: number;
}

export interface MultiTenantReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  organizationCount: number;
  workspaceCount: number;
  membershipCount: number;
  roleCount: number;
  permissionCount: number;
}

export interface MultiTenantWorkflowPathResult {
  workspaceId: string;
  workspaceName: string;
  workspaceType: OrganizationType;
  finalStatus: MembershipInvitationStatus;
  pathValid: boolean;
}

export interface MultiTenantFreezeReport {
  version: typeof MULTI_TENANT_VERSION;
  tag: typeof MULTI_TENANT_TAG;
  reportId: string;
  status: "frozen";
  coverage: MultiTenantCoverageStats;
  validation: MultiTenantFreezeValidation;
  readiness: MultiTenantReadiness;
  workflowPaths: MultiTenantWorkflowPathResult[];
  exampleCollaborationReport: WorkspaceCollaborationReport | null;
  moduleStatistics: {
    frozenDomains: number;
    entityCatalogs: number;
    workflowStates: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: typeof CANONICAL_MULTI_TENANT_QUERY;
  summary: string;
  generatedAt: string;
}

export interface MultiTenantFreezeEvidence {
  evidenceId: string;
  version: typeof MULTI_TENANT_VERSION;
  tag: typeof MULTI_TENANT_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: typeof CANONICAL_MULTI_TENANT_QUERY;
    organizationCount: number;
    workspaceCount: number;
    membershipCount: number;
  };
  coverage: MultiTenantCoverageStats;
  readiness: MultiTenantReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
