/**
 * Product Organization — Organization Management public exports
 * Isolated namespace: lib/product/organization
 */

export {
  HIERARCHY_KINDS,
  MEMBERSHIP_STATUSES,
  ORG_KINDS,
  ORG_ROLES,
  ORG_STATUSES,
  ORGANIZATION_MANAGER_STATUSES,
  ORGANIZATION_READINESS_VERDICTS,
  PRODUCT_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "./management/management.constants";

export type {
  OrganizationManagerStatus,
  OrganizationReadinessCheck,
  OrganizationReadinessResult,
  OrganizationReadinessVerdict,
  OrganizationRegistryManifest,
} from "./management/management.types";

export type {
  CreateOrganizationInput,
  OrganizationUnit,
  OrgKind,
  OrgStatus,
  UnitMetadata,
  UpdateOrganizationStatusInput,
} from "./unit/unit.types";

export {
  clearOrganizations,
  createOrganization,
  getOrganization,
  listOrganizations,
  updateOrganizationStatus,
} from "./unit/unit.registry";

export type {
  AddMembershipInput,
  MembershipMetadata,
  MembershipStatus,
  OrganizationMembership,
} from "./membership/membership.types";

export {
  addMembership,
  clearMemberships,
  getMembership,
  listMemberships,
} from "./membership/membership.registry";

export type {
  HierarchyKind,
  HierarchyMetadata,
  LinkHierarchyInput,
  OrganizationHierarchy,
} from "./hierarchy/hierarchy.types";

export {
  clearHierarchies,
  getHierarchy,
  linkHierarchy,
  listHierarchies,
} from "./hierarchy/hierarchy.registry";

export type {
  AssignOrgRoleInput,
  OrganizationRoleAssignment,
  OrgRoleCode,
  RoleMetadata,
} from "./role/role.types";

export {
  assignOrgRole,
  clearOrgRoles,
  getOrgRole,
  listOrgRoles,
} from "./role/role.registry";

export {
  assertOrganizationManagementReadinessReady,
  evaluateOrganizationManagementReadiness,
} from "./management/management.readiness";

export {
  clearOrganizationManagementLayer,
  createOrganizationManager,
  getOrganizationRegistryManifest,
  type OrganizationManager,
  type OrganizationManagerSnapshot,
} from "./organization.manager";

export {
  assertProductOrganizationReleaseGatePass,
  checkProductOrganizationReleaseGate,
  PRODUCT_ORGANIZATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
