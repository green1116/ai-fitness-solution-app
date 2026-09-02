/**
 * Runtime Ops Product Context Adapter v1 — read-only sidecar.
 *
 * Maps frozen Runtime Ops customerId to validated CRM ProductCommercialContext.
 * Does not mutate EADS/EAC/EWAS projections, fingerprints, or Workspace UI.
 */

import type { ProductCommercialContext } from "@/app/(product)/commercial-context";
import { resolveValidatedProductContextForCustomer } from "@/lib/product/commercial-context-bridge";

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * v1: no Ops → CRM identity mapping registry; always returns null.
 * Future mappings must be explicit and tenant-scoped.
 */
export async function resolveCrmCustomerIdForOpsCustomer(
  organizationId: string,
  opsCustomerId: string,
): Promise<string | null> {
  const orgId = trimId(organizationId);
  const opsId = trimId(opsCustomerId);
  if (!orgId || !opsId) return null;
  return null;
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
