import type { ProductContext } from "../shared/context-types";
import type { ProductCode } from "../shared/product-types";

export function validateProductContextShape(context: ProductContext): boolean {
  if (!context.tenantId?.trim() || !context.workspaceId?.trim() || !context.userId?.trim()) return false;
  if (!context.productCode || !context.productDefinition) return false;
  if (context.workflowStages.length !== context.productDefinition.workflowKeys.length) return false;
  if (!context.v47ModuleMapping.productModule) return false;
  if (context.workspaceBinding.productCode !== context.productCode) return false;
  if (context.workspaceBinding.saasWorkspaceId !== context.workspaceId) return false;
  if (!context.source.resolver || context.source.resolver !== "resolveProductContext") return false;
  return true;
}

export function validateProductContextCompatibility(context: ProductContext): boolean {
  if (!context.productDefinition.portalTypes.includes(context.portalType)) return false;
  if (context.workflowStages.length === 0) return false;
  for (const workflowKey of context.productDefinition.workflowKeys) {
    if (!context.v47ModuleMapping.workflowModules[workflowKey]) return false;
  }
  for (const feature of context.productDefinition.requiredFeatures) {
    if (context.featureFlags.required[feature] !== true) return false;
  }
  return true;
}

export function validateResolvedProductContext(context: ProductContext, productCode: ProductCode): boolean {
  return (
    validateProductContextShape(context) &&
    validateProductContextCompatibility(context) &&
    context.productCode === productCode
  );
}

export interface SaasProductP2ValidationResult {
  valid: boolean;
  summary: string;
}

export function validateSaasProductP2ModuleExports(): SaasProductP2ValidationResult {
  const valid = typeof validateProductContextShape === "function" && typeof validateResolvedProductContext === "function";
  return {
    valid,
    summary: `contextValidationExports=${valid}`,
  };
}
