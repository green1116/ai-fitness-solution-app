/**
 * Runtime Ops Product Context Adapter v1 — read-only sidecar.
 *
 * Maps frozen Runtime Ops customerId to validated CRM ProductCommercialContext.
 * Does not mutate EADS/EAC/EWAS projections, fingerprints, or Workspace UI.
 */

import type { ProductCommercialContext } from "@/app/(product)/commercial-context";
import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { resolveValidatedProductContextForCustomer } from "@/lib/product/commercial-context-bridge";
import { lookupOpsCrmIdentitySeed } from "@/lib/product/runtime-ops-crm-identity-registry";
import { lookupOpsCrmIdentityLink } from "@/lib/product/runtime-ops-crm-identity-store";

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Resolve CRM customer id from explicit Ops ↔ CRM identity registry only.
 * Validates tenant ownership via getCustomerById before returning.
 */
export async function resolveCrmCustomerIdForOpsCustomer(
  organizationId: string,
  opsCustomerId: string,
): Promise<string | null> {
  const orgId = trimId(organizationId);
  const opsId = trimId(opsCustomerId);
  if (!orgId || !opsId) return null;

  const crmCustomerId =
    lookupOpsCrmIdentitySeed(orgId, opsId) ??
    (await lookupOpsCrmIdentityLink(orgId, opsId));
  if (!crmCustomerId) return null;

  const customer = await getCustomerById(crmCustomerId, orgId);
  if (!customer) return null;

  return customer.id;
}

export async function resolveValidatedProductContextForOpsCustomer(
  organizationId: string,
  opsCustomerId: string,
): Promise<ProductCommercialContext | null> {
  const orgId = trimId(organizationId);
  const opsId = trimId(opsCustomerId);
  if (!orgId || !opsId) return null;

  const crmCustomerId = await resolveCrmCustomerIdForOpsCustomer(orgId, opsId);
  if (!crmCustomerId) return null;

  return resolveValidatedProductContextForCustomer(orgId, crmCustomerId);
}
