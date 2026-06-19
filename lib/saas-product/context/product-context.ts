import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import { resolveEntitlementsSync } from "@/lib/saas-subscription/entitlement/entitlement-resolver";
import { hasFeature } from "@/lib/saas-subscription/entitlement/feature-checker";
import { mapProductToV47Module, mapWorkflowToV47Module } from "../mapping/product-to-v47-mapper";
import { resolveProduct } from "../registry/product-registry";
import { resolveWorkflowStage } from "../registry/workflow-stage-catalog";
import { CONTEXT_ERROR_CODES, SaasProductContextError } from "../shared/context-errors";
import type { ProductFeatureFlags, V47ModuleMapping } from "../shared/context-types";
import type { ProductCode, ProductDefinition, WorkflowStageDefinition } from "../shared/product-types";

export interface BoundProductContext {
  productCode: ProductCode;
  productDefinition: ProductDefinition;
  workflowStages: WorkflowStageDefinition[];
  v47ModuleMapping: V47ModuleMapping;
  featureFlags: ProductFeatureFlags;
}

export function bindProductContext(
  tenantId: string,
  productCode: ProductCode,
  portalType: PortalType,
): BoundProductContext {
  const productDefinition = resolveProduct(productCode);

  if (!productDefinition.portalTypes.includes(portalType)) {
    throw new SaasProductContextError(
      CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_PORTAL_INCOMPATIBLE,
      `Product ${productCode} is not available for portal ${portalType}`,
    );
  }

  const workflowStages = productDefinition.workflowKeys.map((workflowKey) => resolveWorkflowStage(workflowKey));
  const workflowModules = Object.fromEntries(
    productDefinition.workflowKeys.map((workflowKey) => [workflowKey, mapWorkflowToV47Module(workflowKey)]),
  );

  const entitlements = resolveEntitlementsSync(tenantId);
  const required = Object.fromEntries(
    productDefinition.requiredFeatures.map((feature) => [feature, true]),
  );
  const enabled = Object.fromEntries(
    productDefinition.requiredFeatures.map((feature) => [feature, hasFeature(entitlements, feature)]),
  );

  return {
    productCode,
    productDefinition,
    workflowStages,
    v47ModuleMapping: {
      productModule: mapProductToV47Module(productCode),
      workflowModules,
    },
    featureFlags: { required, enabled },
  };
}
