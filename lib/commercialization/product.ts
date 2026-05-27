/** RC1 compat entry — @/lib/commercialization/product */
export {
  PRODUCT_FOUNDATION_VERSION,
  runCommercialProductFoundation,
  type CommercialProductFoundationResult,
} from "./_rc1-foundation-compat";

import type { CommercialProductFoundationResult } from "./_rc1-foundation-compat";

export function formatEntitlementModelReadyHook(
  result: CommercialProductFoundationResult,
): string {
  const grantCount = result.entitlements.sample.grants.length;
  return result.productized
    ? `entitlement-model-ready=${result.version} grants=${grantCount}`
    : "entitlement-model-ready=false";
}

export function formatProductCatalogReadyHook(
  result: CommercialProductFoundationResult,
): string {
  const entryCount = result.catalog.entries.length;
  return result.productized
    ? `product-catalog-ready=${result.version} entries=${entryCount}`
    : "product-catalog-ready=false";
}

export function formatProductSurfaceReadyHook(
  result: CommercialProductFoundationResult,
): string {
  return result.productized
    ? `product-surface-ready=${result.version}`
    : "product-surface-ready=false";
}

export function formatWorkspaceReadyHook(
  result: CommercialProductFoundationResult,
): string {
  const workspaceCount = result.workspace.workspaces.length;
  return result.productized
    ? `workspace-ready=${result.version} workspaces=${workspaceCount}`
    : "workspace-ready=false";
}
