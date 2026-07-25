/**
 * Product P2 — Organization Workspace public exports
 * Isolated namespace: lib/product/p2
 */

export {
  DEPARTMENT_STATUSES,
  INVITATION_STATUSES,
  MEMBER_STATUSES,
  ORGANIZATION_STATUSES,
  P2_MANAGER_STATUSES,
  P2_READINESS_VERDICTS,
  PERMISSION_SCOPES,
  PRODUCT_P2_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
  ROLE_KINDS,
  WORKSPACE_STATUSES,
} from "./organization/organization.constants";

export type {
  Organization,
  OrganizationMetadata,
  OrganizationStatus,
  P2ManagerStatus,
  P2ReadinessCheck,
  P2ReadinessResult,
  P2ReadinessVerdict,
  P2RegistryManifest,
  RegisterOrganizationInput,
} from "./organization/organization.types";

export {
  clearOrganizations,
  getOrganization,
  listOrganizations,
  registerOrganization,
  updateOrganizationStatus,
} from "./organization/organization.registry";

export type {
  Department,
  DepartmentMetadata,
  DepartmentStatus,
  RegisterDepartmentInput,
} from "./department/department.types";

export {
  clearDepartments,
  getDepartment,
  listDepartments,
  registerDepartment,
} from "./department/department.registry";

export type {
  MemberMetadata,
  MemberStatus,
  OrganizationMember,
  RegisterMemberInput,
  UpdateMemberStatusInput,
} from "./member/member.types";

export {
  clearMembers,
  getMember,
  listMembers,
  registerMember,
  updateMemberStatus,
} from "./member/member.registry";

export type {
  AssignRoleInput,
  MemberRoleAssignment,
  OrganizationRole,
  RegisterRoleInput,
  RoleKind,
  RoleMetadata,
} from "./role/role.types";

export {
  assignRole,
  clearRoles,
  getRole,
  listRoleAssignments,
  listRoles,
  registerRole,
} from "./role/role.registry";

export type {
  GrantPermissionInput,
  Permission,
  PermissionMetadata,
  PermissionScope,
  RegisterPermissionInput,
  RolePermissionGrant,
} from "./permission/permission.types";

export {
  clearPermissions,
  getPermission,
  grantPermission,
  listPermissionGrants,
  listPermissions,
  registerPermission,
} from "./permission/permission.registry";

export type {
  OrganizationWorkspace,
  RegisterWorkspaceInput,
  UpdateWorkspaceStatusInput,
  WorkspaceMetadata,
  WorkspaceStatus,
} from "./workspace/workspace.types";

export {
  clearWorkspaces,
  getWorkspace,
  listWorkspaces,
  registerWorkspace,
  updateWorkspaceStatus,
} from "./workspace/workspace.registry";

export type {
  CreateInvitationInput,
  InvitationMetadata,
  InvitationRoleKind,
  InvitationStatus,
  OrganizationInvitation,
  UpdateInvitationStatusInput,
} from "./invitation/invitation.types";

export {
  clearInvitations,
  createInvitation,
  getInvitation,
  listInvitations,
  updateInvitationStatus,
} from "./invitation/invitation.registry";

export type {
  BuildDirectoryInput,
  DirectoryEntry,
  DirectoryEntryKind,
  DirectoryIndex,
} from "./directory/directory.types";

export {
  buildDirectoryIndex,
  clearDirectoryIndexes,
  getDirectoryIndex,
  listDirectoryIndexes,
} from "./directory/directory.index";

export {
  assertP2OrganizationWorkspaceReadinessReady,
  evaluateP2OrganizationWorkspaceReadiness,
} from "./directory/directory.readiness";

export {
  clearP2OrganizationWorkspaceLayer,
  createP2OrganizationWorkspaceManager,
  getP2RegistryManifest,
  type P2OrganizationWorkspaceManager,
  type P2OrganizationWorkspaceManagerSnapshot,
} from "./organization.manager";

export {
  assertProductP2ReleaseGatePass,
  checkProductP2ReleaseGate,
  PRODUCT_P2_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
