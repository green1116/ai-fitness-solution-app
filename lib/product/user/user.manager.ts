/**
 * Product User — User Administration Manager
 */

import {
  clearUserAccounts,
  getUserAccount,
  listUserAccounts,
  registerUserAccount,
  updateUserAccountStatus,
} from "./account/account.registry";
import type {
  RegisterUserAccountInput,
  UpdateUserAccountStatusInput,
  UserAccount,
} from "./account/account.types";
import {
  PRODUCT_USER_ADMINISTRATION_BASE,
  PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_USER_ADMINISTRATION_ID,
  PRODUCT_USER_ADMINISTRATION_VERSION,
} from "./administration/administration.constants";
import {
  assertUserAdministrationReadinessReady,
  evaluateUserAdministrationReadiness,
} from "./administration/administration.readiness";
import type {
  UserManagerStatus,
  UserReadinessResult,
  UserRegistryManifest,
} from "./administration/administration.types";
import {
  clearUserLifecycles,
  createUserLifecycle,
  getUserLifecycle,
  listUserLifecycles,
  transitionUserLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  CreateUserLifecycleInput,
  TransitionUserLifecycleInput,
  UserLifecycle,
} from "./lifecycle/lifecycle.types";
import {
  bindUserMembership,
  clearUserMemberships,
  getUserMembership,
  listUserMemberships,
  updateUserMembershipStatus,
} from "./membership/membership.registry";
import type {
  BindUserMembershipInput,
  UpdateUserMembershipStatusInput,
  UserMembership,
} from "./membership/membership.types";
import {
  clearUserPrivileges,
  getUserPrivilege,
  grantUserPrivilege,
  listUserPrivileges,
} from "./privilege/privilege.registry";
import type {
  GrantUserPrivilegeInput,
  UserPrivilege,
} from "./privilege/privilege.types";

export type UserManagerSnapshot = {
  managerId: string;
  status: UserManagerStatus;
  layerId: typeof PRODUCT_USER_ADMINISTRATION_ID;
  version: typeof PRODUCT_USER_ADMINISTRATION_VERSION;
  accountCount: number;
  membershipCount: number;
  privilegeCount: number;
  lifecycleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type UserManager = {
  initialize: () => UserManagerSnapshot;
  start: () => UserManagerSnapshot;
  stop: () => UserManagerSnapshot;
  status: () => UserManagerSnapshot;
  registerAccount: (input: RegisterUserAccountInput) => UserAccount;
  updateAccountStatus: (
    input: UpdateUserAccountStatusInput,
  ) => UserAccount;
  bindMembership: (input: BindUserMembershipInput) => UserMembership;
  updateMembershipStatus: (
    input: UpdateUserMembershipStatusInput,
  ) => UserMembership;
  grantPrivilege: (input: GrantUserPrivilegeInput) => UserPrivilege;
  createLifecycle: (input: CreateUserLifecycleInput) => UserLifecycle;
  transitionLifecycle: (
    input: TransitionUserLifecycleInput,
  ) => UserLifecycle;
  evaluateReadiness: () => UserReadinessResult;
  manifest: () => UserRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getUserRegistryManifest(): UserRegistryManifest {
  return {
    administrationId: PRODUCT_USER_ADMINISTRATION_ID,
    version: PRODUCT_USER_ADMINISTRATION_VERSION,
    freezeVersion: PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
    base: PRODUCT_USER_ADMINISTRATION_BASE,
    accountCount: listUserAccounts().length,
    membershipCount: listUserMemberships().length,
    privilegeCount: listUserPrivileges().length,
    lifecycleCount: listUserLifecycles().length,
  };
}

export function clearUserAdministrationLayer(): void {
  clearUserLifecycles();
  clearUserPrivileges();
  clearUserMemberships();
  clearUserAccounts();
}

export function createUserManager(options?: {
  managerId?: string;
}): UserManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-usr-mgr");
  let state: UserManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): UserManagerSnapshot {
    const reg = getUserRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_USER_ADMINISTRATION_ID,
      version: PRODUCT_USER_ADMINISTRATION_VERSION,
      accountCount: reg.accountCount,
      membershipCount: reg.membershipCount,
      privilegeCount: reg.privilegeCount,
      lifecycleCount: reg.lifecycleCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): UserManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearUserAdministrationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): UserManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): UserManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerAccount: (input) => {
      assertRunning("registerAccount");
      return registerUserAccount(input);
    },
    updateAccountStatus: (input) => {
      assertRunning("updateAccountStatus");
      return updateUserAccountStatus(input);
    },
    bindMembership: (input) => {
      assertRunning("bindMembership");
      return bindUserMembership(input);
    },
    updateMembershipStatus: (input) => {
      assertRunning("updateMembershipStatus");
      return updateUserMembershipStatus(input);
    },
    grantPrivilege: (input) => {
      assertRunning("grantPrivilege");
      return grantUserPrivilege(input);
    },
    createLifecycle: (input) => {
      assertRunning("createLifecycle");
      return createUserLifecycle(input);
    },
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionUserLifecycle(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateUserAdministrationReadiness();
    },
    manifest: getUserRegistryManifest,
  };
}

export {
  assertUserAdministrationReadinessReady,
  getUserAccount,
  getUserLifecycle,
  getUserMembership,
  getUserPrivilege,
  listUserAccounts,
  listUserLifecycles,
  listUserMemberships,
  listUserPrivileges,
};
