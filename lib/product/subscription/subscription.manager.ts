/**
 * Product Subscription — Lifecycle Manager
 */

import {
  changeSubscription,
  clearChanges,
  getChange,
  listChanges,
} from "./change/change.registry";
import type {
  ChangeSubscriptionInput,
  SubscriptionChange,
} from "./change/change.types";
import {
  clearEntitlements,
  getEntitlement,
  grantEntitlement,
  listEntitlements,
  revokeEntitlement,
} from "./entitlement/entitlement.registry";
import type {
  GrantEntitlementInput,
  RevokeEntitlementInput,
  SubscriptionEntitlement,
} from "./entitlement/entitlement.types";
import {
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
} from "./lifecycle/lifecycle.constants";
import {
  assertSubscriptionLifecycleReadinessReady,
  evaluateSubscriptionLifecycleReadiness,
} from "./lifecycle/lifecycle.readiness";
import type {
  SubscriptionManagerStatus,
  SubscriptionReadinessResult,
  SubscriptionRegistryManifest,
} from "./lifecycle/lifecycle.types";
import {
  clearRenewals,
  getRenewal,
  listRenewals,
  renewSubscription,
} from "./renewal/renewal.registry";
import type {
  RenewSubscriptionInput,
  SubscriptionRenewal,
} from "./renewal/renewal.types";
import {
  clearSubscriptions,
  createSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
} from "./subscription/subscription.registry";
import type {
  CreateSubscriptionInput,
  ProductSubscription,
  UpdateSubscriptionPlanInput,
  UpdateSubscriptionStatusInput,
} from "./subscription/subscription.types";

export type SubscriptionManagerSnapshot = {
  managerId: string;
  status: SubscriptionManagerStatus;
  layerId: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_ID;
  version: typeof PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION;
  subscriptionCount: number;
  entitlementCount: number;
  renewalCount: number;
  changeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SubscriptionManager = {
  initialize: () => SubscriptionManagerSnapshot;
  start: () => SubscriptionManagerSnapshot;
  stop: () => SubscriptionManagerSnapshot;
  status: () => SubscriptionManagerSnapshot;
  createSubscription: (input: CreateSubscriptionInput) => ProductSubscription;
  updateSubscriptionStatus: (
    input: UpdateSubscriptionStatusInput,
  ) => ProductSubscription;
  updateSubscriptionPlan: (
    input: UpdateSubscriptionPlanInput,
  ) => ProductSubscription;
  grantEntitlement: (input: GrantEntitlementInput) => SubscriptionEntitlement;
  revokeEntitlement: (input: RevokeEntitlementInput) => SubscriptionEntitlement;
  renewSubscription: (input: RenewSubscriptionInput) => SubscriptionRenewal;
  changeSubscription: (input: ChangeSubscriptionInput) => SubscriptionChange;
  evaluateReadiness: () => SubscriptionReadinessResult;
  manifest: () => SubscriptionRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSubscriptionRegistryManifest(): SubscriptionRegistryManifest {
  return {
    foundationId: PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
    version: PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
    base: PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
    subscriptionCount: listSubscriptions().length,
    entitlementCount: listEntitlements().length,
    renewalCount: listRenewals().length,
    changeCount: listChanges().length,
  };
}

export function clearSubscriptionLifecycleLayer(): void {
  clearChanges();
  clearRenewals();
  clearEntitlements();
  clearSubscriptions();
}

export function createSubscriptionManager(options?: {
  managerId?: string;
}): SubscriptionManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-sub-mgr");
  let state: SubscriptionManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SubscriptionManagerSnapshot {
    const reg = getSubscriptionRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
      version: PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
      subscriptionCount: reg.subscriptionCount,
      entitlementCount: reg.entitlementCount,
      renewalCount: reg.renewalCount,
      changeCount: reg.changeCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SubscriptionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSubscriptionLifecycleLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SubscriptionManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SubscriptionManagerSnapshot {
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
    createSubscription: (input) => {
      assertRunning("createSubscription");
      return createSubscription(input);
    },
    updateSubscriptionStatus: (input) => {
      assertRunning("updateSubscriptionStatus");
      return updateSubscriptionStatus(input);
    },
    updateSubscriptionPlan: (input) => {
      assertRunning("updateSubscriptionPlan");
      return updateSubscriptionPlan(input);
    },
    grantEntitlement: (input) => {
      assertRunning("grantEntitlement");
      return grantEntitlement(input);
    },
    revokeEntitlement: (input) => {
      assertRunning("revokeEntitlement");
      return revokeEntitlement(input);
    },
    renewSubscription: (input) => {
      assertRunning("renewSubscription");
      return renewSubscription(input);
    },
    changeSubscription: (input) => {
      assertRunning("changeSubscription");
      return changeSubscription(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateSubscriptionLifecycleReadiness();
    },
    manifest: getSubscriptionRegistryManifest,
  };
}

export {
  assertSubscriptionLifecycleReadinessReady,
  getChange,
  getEntitlement,
  getRenewal,
  getSubscription,
  listChanges,
  listEntitlements,
  listRenewals,
  listSubscriptions,
};
