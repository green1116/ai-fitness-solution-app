/**
 * E12-P7 — Commercial Control Plane types
 */

import type {
  COMMERCIAL_MANAGER_STATUSES,
  COMMERCIAL_POLICY_KINDS,
  COMMERCIAL_POLICY_STATUSES,
  CUSTOMER_LIFECYCLE_STAGES,
  E12_COMMERCIAL_CONTROL_BASE,
  E12_COMMERCIAL_CONTROL_FREEZE_VERSION,
  E12_COMMERCIAL_CONTROL_ID,
  E12_COMMERCIAL_CONTROL_VERSION,
  PRODUCT_OPERATION_KINDS,
  PRODUCT_OPERATION_STATUSES,
  SLA_STATUSES,
  SLA_TIERS,
} from "./commercial.constants";
import type { ProductMetadata } from "../types/product.types";

export type ProductOperationKind = (typeof PRODUCT_OPERATION_KINDS)[number];
export type ProductOperationStatus = (typeof PRODUCT_OPERATION_STATUSES)[number];
export type CustomerLifecycleStage = (typeof CUSTOMER_LIFECYCLE_STAGES)[number];
export type CommercialPolicyKind = (typeof COMMERCIAL_POLICY_KINDS)[number];
export type CommercialPolicyStatus = (typeof COMMERCIAL_POLICY_STATUSES)[number];
export type SlaTier = (typeof SLA_TIERS)[number];
export type SlaStatus = (typeof SLA_STATUSES)[number];
export type CommercialManagerStatus =
  (typeof COMMERCIAL_MANAGER_STATUSES)[number];

export type { ProductMetadata };

/** Product operations model. */
export type ProductOperation = {
  id: string;
  productId: string;
  productTenantId?: string;
  organizationId?: string;
  kind: ProductOperationKind;
  status: ProductOperationStatus;
  title: string;
  detail: string;
  metadata: ProductMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductOperationInput = {
  id?: string;
  productId: string;
  productTenantId?: string;
  organizationId?: string;
  kind: ProductOperationKind;
  status?: ProductOperationStatus;
  title: string;
  detail?: string;
  metadata?: ProductMetadata;
};

/** Customer lifecycle. */
export type CustomerLifecycleRecord = {
  id: string;
  organizationId: string;
  productId: string;
  productTenantId?: string;
  stage: CustomerLifecycleStage;
  previousStage?: CustomerLifecycleStage;
  reason?: string;
  metadata: ProductMetadata;
  transitionedAt: string;
};

export type TransitionCustomerLifecycleInput = {
  id?: string;
  organizationId: string;
  productId: string;
  productTenantId?: string;
  stage: CustomerLifecycleStage;
  reason?: string;
  metadata?: ProductMetadata;
};

/** Revenue analytics. */
export type RevenueAnalytics = {
  productId?: string;
  mrr: number;
  arr: number;
  totalPaid: number;
  totalInvoiced: number;
  activeSubscriptions: number;
  overageSubscriptions: number;
  apiUsageCount: number;
  computedAt: string;
};

/** Commercial policy. */
export type CommercialPolicy = {
  id: string;
  productId: string;
  kind: CommercialPolicyKind;
  name: string;
  status: CommercialPolicyStatus;
  rules: Record<string, unknown>;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateCommercialPolicyInput = {
  id?: string;
  productId: string;
  kind: CommercialPolicyKind;
  name: string;
  status?: CommercialPolicyStatus;
  rules?: Record<string, unknown>;
  metadata?: ProductMetadata;
};

export type CommercialPolicyEvaluation = {
  policyId: string;
  decision: "ALLOW" | "DENY";
  reason: string;
  evaluatedAt: string;
};

/** SLA model. */
export type SlaAgreement = {
  id: string;
  productId: string;
  productTenantId: string;
  organizationId?: string;
  tier: SlaTier;
  uptimeTarget: number;
  responseMinutes: number;
  status: SlaStatus;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateSlaAgreementInput = {
  id?: string;
  productId: string;
  productTenantId: string;
  organizationId?: string;
  tier?: SlaTier;
  uptimeTarget?: number;
  responseMinutes?: number;
  status?: SlaStatus;
  metadata?: ProductMetadata;
};

/** Business dashboard metrics. */
export type BusinessDashboardMetrics = {
  productId?: string;
  activeCustomers: number;
  atRiskCustomers: number;
  openOperations: number;
  activePolicies: number;
  activeSlas: number;
  breachedSlas: number;
  deploymentPackages: number;
  revenue: RevenueAnalytics;
  computedAt: string;
};

export type CommercialControlRegistryManifest = {
  commercialControlId: typeof E12_COMMERCIAL_CONTROL_ID;
  version: typeof E12_COMMERCIAL_CONTROL_VERSION;
  freezeVersion: typeof E12_COMMERCIAL_CONTROL_FREEZE_VERSION;
  base: typeof E12_COMMERCIAL_CONTROL_BASE;
  operationCount: number;
  customerCount: number;
  policyCount: number;
  slaCount: number;
};
