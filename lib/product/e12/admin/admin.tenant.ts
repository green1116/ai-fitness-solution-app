/**
 * E12-P3 — Tenant Administration
 * Integrates tenant product, entitlement, and capability access
 */

import { getProductIdentity } from "../identity/product.identity";
import { evaluateCapabilityAccess, listAllowedCapabilities } from "../tenant/tenant.access";
import { listEntitlements } from "../tenant/tenant.entitlement";
import {
  getProductTenant,
  listProductTenants,
  setProductTenantStatus,
} from "../tenant/tenant.product";
import { listSubscriptions } from "../tenant/tenant.subscription";
import { getOrganization } from "./admin.organization";
import type {
  TenantAdministrationAction,
  TenantAdministrationSummary,
} from "./admin.types";

const tenantOrgLinks = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

export function linkTenantToOrganization(
  productTenantId: string,
  organizationId: string,
): void {
  const tenant = getProductTenant(productTenantId.trim());
  if (!tenant) throw new Error(`product tenant not found: ${productTenantId}`);
  const org = getOrganization(organizationId.trim());
  if (!org) throw new Error(`organization not found: ${organizationId}`);
  if (tenant.productId !== org.productId) {
    throw new Error(
      `tenant product mismatch: tenant=${tenant.productId} org=${org.productId}`,
    );
  }
  tenantOrgLinks.set(tenant.id, org.id);
}

export function getTenantOrganizationId(
  productTenantId: string,
): string | undefined {
  return tenantOrgLinks.get(productTenantId.trim());
}

export function getTenantAdministrationSummary(
  productTenantId: string,
): TenantAdministrationSummary {
  const tenant = getProductTenant(productTenantId.trim());
  if (!tenant) throw new Error(`product tenant not found: ${productTenantId}`);
  if (!getProductIdentity(tenant.productId)) {
    throw new Error(`product not found: ${tenant.productId}`);
  }

  const subs = listSubscriptions({ productTenantId: tenant.id });
  const ents = listEntitlements({
    productTenantId: tenant.id,
    status: "GRANTED",
  });

  return {
    productTenantId: tenant.id,
    organizationId: getTenantOrganizationId(tenant.id),
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    productId: tenant.productId,
    workspaceId: tenant.workspaceId,
    subscriptionCount: subs.length,
    entitlementCount: ents.length,
    allowedCapabilities: listAllowedCapabilities(tenant.id),
  };
}

export function listTenantAdministrationSummaries(filter?: {
  productId?: string;
  organizationId?: string;
}): TenantAdministrationSummary[] {
  let tenants = listProductTenants(
    filter?.productId ? { productId: filter.productId } : undefined,
  );
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    tenants = tenants.filter(
      (t) => getTenantOrganizationId(t.id) === oid,
    );
  }
  return tenants.map((t) => getTenantAdministrationSummary(t.id));
}

export function suspendTenantAdministration(input: {
  productTenantId: string;
  performedBy: string;
}): TenantAdministrationAction {
  setProductTenantStatus(input.productTenantId.trim(), "SUSPENDED");
  return {
    action: "SUSPEND",
    productTenantId: input.productTenantId.trim(),
    organizationId: getTenantOrganizationId(input.productTenantId),
    performedBy: input.performedBy.trim(),
    performedAt: nowIso(),
  };
}

export function activateTenantAdministration(input: {
  productTenantId: string;
  performedBy: string;
}): TenantAdministrationAction {
  setProductTenantStatus(input.productTenantId.trim(), "ACTIVE");
  return {
    action: "ACTIVATE",
    productTenantId: input.productTenantId.trim(),
    organizationId: getTenantOrganizationId(input.productTenantId),
    performedBy: input.performedBy.trim(),
    performedAt: nowIso(),
  };
}

export function evaluateTenantCapabilityAccess(input: {
  productTenantId: string;
  capabilityRef: string;
}) {
  return evaluateCapabilityAccess({
    productTenantId: input.productTenantId.trim(),
    capabilityRef: input.capabilityRef.trim(),
  });
}

export function clearTenantAdministration(): void {
  tenantOrgLinks.clear();
}
