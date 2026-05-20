import type { CommercialClosureFoundationResult } from "../closure/closure-summary";
import { buildCapabilityBundles } from "./capability-bundle";
import { buildEntitlementModel } from "./entitlement-model";
import { buildPlanSummary } from "./plan-summary";
import { buildProductCatalog } from "./product-catalog";
import { buildProductTierMatrix } from "./tier-matrix";
import { buildSampleWorkspaceRegistry } from "./workspace";
import type { CommercialPackagingTier } from "../packaging/tier-mapping";
import { normalizeProductTier } from "../packaging/tier-mapping";

export const PRODUCT_FOUNDATION_VERSION = "3.7-product-1" as const;

export type CommercialProductFoundationInput = {
  deploymentId: string;
  tier?: CommercialPackagingTier | string;
  closure?: CommercialClosureFoundationResult;
  workspaceName?: string;
};

export type CommercialProductFoundationResult = {
  version: typeof PRODUCT_FOUNDATION_VERSION;
  deploymentId: string;
  tier: CommercialPackagingTier;
  catalog: ReturnType<typeof buildProductCatalog>;
  tierMatrix: ReturnType<typeof buildProductTierMatrix>;
  entitlements: ReturnType<typeof buildEntitlementModel>;
  workspace: ReturnType<typeof buildSampleWorkspaceRegistry>;
  plans: ReturnType<typeof buildPlanSummary>;
  bundles: ReturnType<typeof buildCapabilityBundles>;
  v36Sealed: boolean;
  productized: boolean;
  summary: string;
};

export function runCommercialProductFoundation(
  input: CommercialProductFoundationInput,
): CommercialProductFoundationResult {
  const tier = normalizeProductTier(
    typeof input.tier === "string" ? input.tier : input.tier,
  );

  const closure = input.closure;
  const v36Sealed = closure
    ? closure.sealed === true ||
      closure.closed === true ||
      (closure.archiveReadiness.ready &&
        closure.surfaceSeal.v35FreezeIntact &&
        closure.surfaceSeal.v36PublicOnly &&
        closure.surfaceSeal.noRuntimeExpansion)
    : false;
  if (closure && !v36Sealed) {
    throw new Error(
      "PRODUCT_V36_NOT_SEALED: V3.6 closure must be sealed before productization",
    );
  }

  const catalog = buildProductCatalog();
  const tierMatrix = buildProductTierMatrix();
  const entitlements = buildEntitlementModel(tier);
  const workspace = buildSampleWorkspaceRegistry(input.deploymentId);
  const plans = buildPlanSummary();
  const bundles = buildCapabilityBundles(tier);

  const productized =
    v36Sealed &&
    catalog.entries.length > 0 &&
    tierMatrix.rows.length > 0 &&
    entitlements.sample.grants.length > 0 &&
    workspace.workspaces.length > 0 &&
    bundles.bundles.length > 0;

  void input.workspaceName;

  const summary = [
    `product=${PRODUCT_FOUNDATION_VERSION}`,
    catalog.summary,
    tierMatrix.summary,
    entitlements.summary,
    workspace.summary,
    plans.summary,
    bundles.summary,
    `v36-sealed=${v36Sealed}`,
    `productized=${productized}`,
    `deployment=${input.deploymentId}`,
  ].join(" ");

  return {
    version: PRODUCT_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier,
    catalog,
    tierMatrix,
    entitlements,
    workspace,
    plans,
    bundles,
    v36Sealed,
    productized,
    summary,
  };
}

export function formatProductCatalogReadyHook(
  result: CommercialProductFoundationResult,
): string {
  return result.productized
    ? `product-catalog-ready=${result.catalog.version}`
    : "product-catalog-ready=false";
}

export function formatEntitlementModelReadyHook(
  result: CommercialProductFoundationResult,
): string {
  return result.productized
    ? `entitlement-model-ready=${result.entitlements.version}`
    : "entitlement-model-ready=false";
}

export function formatWorkspaceReadyHook(
  result: CommercialProductFoundationResult,
): string {
  return result.productized
    ? `workspace-ready=${result.workspace.version}`
    : "workspace-ready=false";
}

export function formatProductSurfaceReadyHook(
  result: CommercialProductFoundationResult,
): string {
  return result.productized
    ? `product-surface-ready=${result.version}`
    : "product-surface-ready=false";
}
