/**
 * Product User — User Administration public exports
 * Isolated namespace: lib/product/user
 */

export {
  PRODUCT_USER_ADMINISTRATION_BASE,
  PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_USER_ADMINISTRATION_ID,
  PRODUCT_USER_ADMINISTRATION_VERSION,
  PRODUCT_USER_FREEZE_VERSION,
  USER_ACCOUNT_KINDS,
  USER_ACCOUNT_STATUSES,
  USER_LIFECYCLE_STATES,
  USER_MANAGER_STATUSES,
  USER_MEMBERSHIP_ROLES,
  USER_MEMBERSHIP_STATUSES,
  USER_PRIVILEGE_SCOPES,
  USER_READINESS_VERDICTS,
} from "./administration/administration.constants";

export type {
  UserManagerStatus,
  UserReadinessCheck,
  UserReadinessResult,
  UserReadinessVerdict,
  UserRegistryManifest,
} from "./administration/administration.types";

export type {
  AccountMetadata,
  RegisterUserAccountInput,
  UpdateUserAccountStatusInput,
  UserAccount,
  UserAccountKind,
  UserAccountStatus,
} from "./account/account.types";

export {
  clearUserAccounts,
  getUserAccount,
  listUserAccounts,
  registerUserAccount,
  updateUserAccountStatus,
} from "./account/account.registry";

export type {
  BindUserMembershipInput,
  MembershipMetadata,
  UpdateUserMembershipStatusInput,
  UserMembership,
  UserMembershipRole,
  UserMembershipStatus,
} from "./membership/membership.types";

export {
  bindUserMembership,
  clearUserMemberships,
  getUserMembership,
  listUserMemberships,
  updateUserMembershipStatus,
} from "./membership/membership.registry";

export type {
  GrantUserPrivilegeInput,
  PrivilegeMetadata,
  UserPrivilege,
  UserPrivilegeScope,
} from "./privilege/privilege.types";

export {
  clearUserPrivileges,
  getUserPrivilege,
  grantUserPrivilege,
  listUserPrivileges,
} from "./privilege/privilege.registry";

export type {
  CreateUserLifecycleInput,
  LifecycleMetadata,
  TransitionUserLifecycleInput,
  UserLifecycle,
  UserLifecycleState,
} from "./lifecycle/lifecycle.types";

export {
  clearUserLifecycles,
  createUserLifecycle,
  getUserLifecycle,
  listUserLifecycles,
  transitionUserLifecycle,
} from "./lifecycle/lifecycle.registry";

export {
  assertUserAdministrationReadinessReady,
  evaluateUserAdministrationReadiness,
} from "./administration/administration.readiness";

export {
  clearUserAdministrationLayer,
  createUserManager,
  getUserRegistryManifest,
  type UserManager,
  type UserManagerSnapshot,
} from "./user.manager";

export {
  assertProductUserReleaseGatePass,
  checkProductUserReleaseGate,
  PRODUCT_USER_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
