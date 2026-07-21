/**
 * E12-P7 — Business Dashboard Metrics
 * Aggregates operations, customers, policies, SLAs, deployment, revenue
 */

import { listDeploymentPackages } from "../deployment/deployment.package";
import {
  getCustomerLifecycleStage,
  listCustomerLifecycleRecords,
} from "./commercial.customer";
import { listProductOperations } from "./commercial.operations";
import { listCommercialPolicies } from "./commercial.policy";
import { computeRevenueAnalytics } from "./commercial.revenue";
import { listSlaAgreements } from "./commercial.sla";
import type { BusinessDashboardMetrics } from "./commercial.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeBusinessDashboardMetrics(filter?: {
  productId?: string;
}): BusinessDashboardMetrics {
  const productId = filter?.productId?.trim();

  const customers = listCustomerLifecycleRecords(
    productId ? { productId } : undefined,
  );
  const orgIds = [...new Set(customers.map((c) => c.organizationId))];
  let activeCustomers = 0;
  let atRiskCustomers = 0;
  for (const oid of orgIds) {
    const stage = productId
      ? getCustomerLifecycleStage(oid, productId)
      : customers.find((c) => c.organizationId === oid)?.stage;
    if (stage === "ACTIVE" || stage === "ONBOARDING") activeCustomers += 1;
    if (stage === "AT_RISK") atRiskCustomers += 1;
  }

  const openOperations = listProductOperations({
    productId,
    status: "OPEN",
  }).length;

  const activePolicies = listCommercialPolicies({
    productId,
    status: "ACTIVE",
  }).length;

  const slas = listSlaAgreements(productId ? { productId } : undefined);
  const activeSlas = slas.filter((s) => s.status === "ACTIVE").length;
  const breachedSlas = slas.filter((s) => s.status === "BREACHED").length;

  const deploymentPackages = listDeploymentPackages(
    productId ? { productId } : undefined,
  ).length;

  const revenue = computeRevenueAnalytics(
    productId ? { productId } : undefined,
  );

  return {
    productId,
    activeCustomers,
    atRiskCustomers,
    openOperations,
    activePolicies,
    activeSlas,
    breachedSlas,
    deploymentPackages,
    revenue,
    computedAt: nowIso(),
  };
}
