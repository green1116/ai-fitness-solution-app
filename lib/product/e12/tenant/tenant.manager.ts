/**
 * E12-P2 — Tenant Product Manager
 * Orchestrates workspace / tenant / subscription / entitlement / access
 */

import { getProductRegistryManifest } from "../registry/product.registry";
import {
  E12_TENANT_PRODUCT_BASE,
  E12_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_ID,
  E12_TENANT_PRODUCT_VERSION,
} from "./tenant.constants";
import {
  evaluateCapabilityAccess,
  listAllowedCapabilities,
} from "./tenant.access";
import {
  clearEntitlements,
  grantEntitlement,
  listEntitlements,
} from "./tenant.entitlement";
import {
  clearProductTenants,
  getProductTenant,
  listProductTenants,
  registerProductTenant,
  setProductTenantStatus,
} from "./tenant.product";
import {
  bindSubscription,
  clearSubscriptions,
  getSubscription,
  listSubscriptions,
} from "./tenant.subscription";
import {
  clearWorkspaces,
  createWorkspace,
  getWorkspace,
  listWorkspaces,
} from "./tenant.workspace";
import type {
  BindSubscriptionInput,
  CapabilityAccessResult,
  CreateWorkspaceInput,
  FeatureEntitlement,
  ProductTenant,
  ProductWorkspace,
  RegisterProductTenantInput,
  SubscriptionBinding,
  TenantProductManagerStatus,
  TenantProductRegistryManifest,
} from "./tenant.types";

export type TenantProductManagerSnapshot = {
  managerId: string;
  status: TenantProductManagerStatus;
  layerId: typeof E12_TENANT_PRODUCT_ID;
  version: typeof E12_TENANT_PRODUCT_VERSION;
  workspaceCount: number;
  tenantCount: number;
  subscriptionCount: number;
  entitlementCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type TenantProductManager = {
  initialize: () => TenantProductManagerSnapshot;
  start: () => TenantProductManagerSnapshot;
  stop: () => TenantProductManagerSnapshot;
  status: () => TenantProductManagerSnapshot;
  createWorkspace: (input: CreateWorkspaceInput) => ProductWorkspace;
  getWorkspace: typeof getWorkspace;
  listWorkspaces: typeof listWorkspaces;
  registerTenant: (input: RegisterProductTenantInput) => ProductTenant;
  getTenant: typeof getProductTenant;
  listTenants: typeof listProductTenants;
  activateTenant: (tenantId: string) => ProductTenant;
  bindSubscription: (input: BindSubscriptionInput) => SubscriptionBinding;
  getSubscription: typeof getSubscription;
  listSubscriptions: typeof listSubscriptions;
  grantEntitlement: typeof grantEntitlement;
  listEntitlements: typeof listEntitlements;
  evaluateAccess: (input: {
    productTenantId: string;
    capabilityRef: string;
  }) => CapabilityAccessResult;
  allowedCapabilities: (productTenantId: string) => string[];
  manifest: () => TenantProductRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getTenantProductRegistryManifest(): TenantProductRegistryManifest {
  return {
    tenantProductId: E12_TENANT_PRODUCT_ID,
    version: E12_TENANT_PRODUCT_VERSION,
    freezeVersion: E12_TENANT_PRODUCT_FREEZE_VERSION,
    base: E12_TENANT_PRODUCT_BASE,
    workspaceCount: listWorkspaces().length,
    tenantCount: listProductTenants().length,
    subscriptionCount: listSubscriptions().length,
    entitlementCount: listEntitlements().length,
  };
}

export function clearTenantProductLayer(): void {
  clearEntitlements();
  clearSubscriptions();
  clearProductTenants();
  clearWorkspaces();
}

export function createTenantProductManager(options?: {
  managerId?: string;
}): TenantProductManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-tpm-mgr");
  let state: TenantProductManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): TenantProductManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const reg = getTenantProductRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_TENANT_PRODUCT_ID,
      version: E12_TENANT_PRODUCT_VERSION,
      workspaceCount: reg.workspaceCount,
      tenantCount: reg.tenantCount,
      subscriptionCount: reg.subscriptionCount,
      entitlementCount: reg.entitlementCount,
      productIdentityCount: productReg.identityCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): TenantProductManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearTenantProductLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): TenantProductManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): TenantProductManagerSnapshot {
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
    createWorkspace: (input) => {
      assertRunning("createWorkspace");
      return createWorkspace(input);
    },
    getWorkspace,
    listWorkspaces,
    registerTenant: (input) => {
      assertRunning("registerTenant");
      return registerProductTenant(input);
    },
    getTenant: getProductTenant,
    listTenants: listProductTenants,
    activateTenant: (tenantId) => {
      assertRunning("activateTenant");
      return setProductTenantStatus(tenantId, "ACTIVE");
    },
    bindSubscription: (input) => {
      assertRunning("bindSubscription");
      return bindSubscription(input);
    },
    getSubscription,
    listSubscriptions,
    grantEntitlement: (input) => {
      assertRunning("grantEntitlement");
      return grantEntitlement(input);
    },
    listEntitlements,
    evaluateAccess: (input) => {
      assertRunning("evaluateAccess");
      return evaluateCapabilityAccess(input);
    },
    allowedCapabilities: (productTenantId) => {
      assertRunning("allowedCapabilities");
      return listAllowedCapabilities(productTenantId);
    },
    manifest: getTenantProductRegistryManifest,
  };
}
