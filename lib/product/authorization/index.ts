/**
 * Product Authorization — RBAC public exports
 * Isolated namespace: lib/product/authorization
 */

export {
  ASSIGNMENT_STATUSES,
  AUTHORIZATION_MANAGER_STATUSES,
  AUTHORIZATION_READINESS_VERDICTS,
  DECISION_RESULTS,
  PERMISSION_EFFECTS,
  PRODUCT_AUTHORIZATION_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
  ROLE_KINDS,
} from "./rbac/rbac.constants";

export type {
  AuthorizationManagerStatus,
  AuthorizationReadinessCheck,
  AuthorizationReadinessResult,
  AuthorizationReadinessVerdict,
  AuthorizationRegistryManifest,
} from "./rbac/rbac.types";

export type {
  AuthorizationRole,
  RegisterRoleInput,
  RoleKind,
  RoleMetadata,
} from "./role/role.types";

export {
  clearRoles,
  getRole,
  listRoles,
  registerRole,
} from "./role/role.registry";

export type {
  AuthorizationPermission,
  PermissionEffect,
  PermissionMetadata,
  RegisterPermissionInput,
} from "./permission/permission.types";

export {
  clearPermissions,
  getPermission,
  listPermissions,
  registerPermission,
} from "./permission/permission.registry";

export type {
  GrantMetadata,
  GrantPermissionInput,
  PermissionGrant,
} from "./grant/grant.types";

export {
  clearGrants,
  getGrant,
  grantPermission,
  listGrants,
} from "./grant/grant.registry";

export type {
  AssignmentMetadata,
  AssignmentStatus,
  AssignRoleInput,
  RoleAssignment,
  UpdateAssignmentStatusInput,
} from "./assignment/assignment.types";

export {
  assignRole,
  clearAssignments,
  getAssignment,
  listAssignments,
  updateAssignmentStatus,
} from "./assignment/assignment.registry";

export type {
  AuthorizationDecision,
  AuthorizeInput,
  DecisionMetadata,
  DecisionResult,
} from "./decision/decision.types";

export {
  authorize,
  clearDecisions,
  getDecision,
  listDecisions,
} from "./decision/decision.registry";

export {
  assertAuthorizationRbacReadinessReady,
  evaluateAuthorizationRbacReadiness,
} from "./rbac/rbac.readiness";

export {
  clearAuthorizationRbacLayer,
  createAuthorizationManager,
  getAuthorizationRegistryManifest,
  type AuthorizationManager,
  type AuthorizationManagerSnapshot,
} from "./authorization.manager";

export {
  assertProductAuthorizationReleaseGatePass,
  checkProductAuthorizationReleaseGate,
  PRODUCT_AUTHORIZATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
