/**
 * E12-P7 — Commercial Control Plane Manager
 */

import { getAdminConsoleRegistryManifest } from "../admin/admin.manager";
import { getBillingCommercialRegistryManifest } from "../billing/billing.manager";
import { getDeploymentRegistryManifest } from "../deployment/deployment.manager";
import { getProductRegistryManifest } from "../registry/product.registry";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import {
  E12_COMMERCIAL_CONTROL_BASE,
  E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_ID,
  E12_COMMERCIAL_CONTROL_VERSION,
} from "./commercial.constants";
import {
  clearCustomerLifecycles,
  getCustomerLifecycleStage,
  listActiveCustomers,
  listCustomerLifecycleRecords,
  transitionCustomerLifecycle,
} from "./commercial.customer";
import { computeBusinessDashboardMetrics } from "./commercial.dashboard";
import {
  clearProductOperations,
  createProductOperation,
  getProductOperation,
  listProductOperations,
  setProductOperationStatus,
} from "./commercial.operations";
import {
  clearCommercialPolicies,
  createCommercialPolicy,
  evaluateCommercialPolicy,
  getCommercialPolicy,
  listCommercialPolicies,
} from "./commercial.policy";
import { computeRevenueAnalytics } from "./commercial.revenue";
import {
  clearSlaAgreements,
  createSlaAgreement,
  getSlaAgreement,
  listSlaAgreements,
  setSlaStatus,
} from "./commercial.sla";
import type {
  BusinessDashboardMetrics,
  CommercialControlRegistryManifest,
  CommercialManagerStatus,
  CommercialPolicy,
  CommercialPolicyEvaluation,
  CreateCommercialPolicyInput,
  CreateProductOperationInput,
  CreateSlaAgreementInput,
  CustomerLifecycleRecord,
  ProductOperation,
  ProductOperationStatus,
  RevenueAnalytics,
  SlaAgreement,
  SlaStatus,
  TransitionCustomerLifecycleInput,
} from "./commercial.types";

export type CommercialControlManagerSnapshot = {
  managerId: string;
  status: CommercialManagerStatus;
  layerId: typeof E12_COMMERCIAL_CONTROL_ID;
  version: typeof E12_COMMERCIAL_CONTROL_VERSION;
  operationCount: number;
  customerCount: number;
  policyCount: number;
  slaCount: number;
  tenantProductCount: number;
  billingSubscriptionCount: number;
  adminOrganizationCount: number;
  deploymentPackageCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CommercialControlManager = {
  initialize: () => CommercialControlManagerSnapshot;
  start: () => CommercialControlManagerSnapshot;
  stop: () => CommercialControlManagerSnapshot;
  status: () => CommercialControlManagerSnapshot;
  createOperation: (input: CreateProductOperationInput) => ProductOperation;
  setOperationStatus: (id: string, status: ProductOperationStatus) => ProductOperation;
  getOperation: typeof getProductOperation;
  listOperations: typeof listProductOperations;
  transitionCustomer: (
    input: TransitionCustomerLifecycleInput,
  ) => CustomerLifecycleRecord;
  getCustomerStage: typeof getCustomerLifecycleStage;
  listCustomers: typeof listCustomerLifecycleRecords;
  listActiveCustomers: typeof listActiveCustomers;
  createPolicy: (input: CreateCommercialPolicyInput) => CommercialPolicy;
  getPolicy: typeof getCommercialPolicy;
  listPolicies: typeof listCommercialPolicies;
  evaluatePolicy: (input: {
    policyId: string;
    context?: Record<string, unknown>;
  }) => CommercialPolicyEvaluation;
  createSla: (input: CreateSlaAgreementInput) => SlaAgreement;
  setSlaStatus: (id: string, status: SlaStatus) => SlaAgreement;
  getSla: typeof getSlaAgreement;
  listSlas: typeof listSlaAgreements;
  revenue: (filter?: {
    productId?: string;
    productTenantId?: string;
  }) => RevenueAnalytics;
  dashboard: (filter?: { productId?: string }) => BusinessDashboardMetrics;
  manifest: () => CommercialControlRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCommercialControlRegistryManifest(): CommercialControlRegistryManifest {
  return {
    commercialControlId: E12_COMMERCIAL_CONTROL_ID,
    version: E12_COMMERCIAL_CONTROL_VERSION,
    freezeVersion: E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
    base: E12_COMMERCIAL_CONTROL_BASE,
    operationCount: listProductOperations().length,
    customerCount: listActiveCustomers().length,
    policyCount: listCommercialPolicies().length,
    slaCount: listSlaAgreements().length,
  };
}

export function clearCommercialControlLayer(): void {
  clearSlaAgreements();
  clearCommercialPolicies();
  clearCustomerLifecycles();
  clearProductOperations();
}

export function createCommercialControlManager(options?: {
  managerId?: string;
}): CommercialControlManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-ccm-mgr");
  let state: CommercialManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CommercialControlManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const billingReg = getBillingCommercialRegistryManifest();
    const adminReg = getAdminConsoleRegistryManifest();
    const deployReg = getDeploymentRegistryManifest();
    const reg = getCommercialControlRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_COMMERCIAL_CONTROL_ID,
      version: E12_COMMERCIAL_CONTROL_VERSION,
      operationCount: reg.operationCount,
      customerCount: reg.customerCount,
      policyCount: reg.policyCount,
      slaCount: reg.slaCount,
      tenantProductCount: tenantReg.tenantCount,
      billingSubscriptionCount: billingReg.billingSubscriptionCount,
      adminOrganizationCount: adminReg.organizationCount,
      deploymentPackageCount: deployReg.packageCount,
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

  function initialize(): CommercialControlManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCommercialControlLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CommercialControlManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CommercialControlManagerSnapshot {
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
    createOperation: (input) => {
      assertRunning("createOperation");
      return createProductOperation(input);
    },
    setOperationStatus: (id, status) => {
      assertRunning("setOperationStatus");
      return setProductOperationStatus(id, status);
    },
    getOperation: getProductOperation,
    listOperations: listProductOperations,
    transitionCustomer: (input) => {
      assertRunning("transitionCustomer");
      return transitionCustomerLifecycle(input);
    },
    getCustomerStage: getCustomerLifecycleStage,
    listCustomers: listCustomerLifecycleRecords,
    listActiveCustomers,
    createPolicy: (input) => {
      assertRunning("createPolicy");
      return createCommercialPolicy(input);
    },
    getPolicy: getCommercialPolicy,
    listPolicies: listCommercialPolicies,
    evaluatePolicy: (input) => {
      assertRunning("evaluatePolicy");
      return evaluateCommercialPolicy(input);
    },
    createSla: (input) => {
      assertRunning("createSla");
      return createSlaAgreement(input);
    },
    setSlaStatus: (id, status) => {
      assertRunning("setSlaStatus");
      return setSlaStatus(id, status);
    },
    getSla: getSlaAgreement,
    listSlas: listSlaAgreements,
    revenue: (filter) => {
      assertRunning("revenue");
      return computeRevenueAnalytics(filter);
    },
    dashboard: (filter) => {
      assertRunning("dashboard");
      return computeBusinessDashboardMetrics(filter);
    },
    manifest: getCommercialControlRegistryManifest,
  };
}
