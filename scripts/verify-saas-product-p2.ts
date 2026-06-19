/**
 * V49 SaaS Product — Phase 2 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  CONTEXT_ERROR_CODES,
  SAAS_PRODUCT_P2_TAG,
  SaasProductContextError,
  bindProductContext,
  bindTenantContext,
  bindWorkspaceContext,
  resolveProductContext,
  validateProductContextShape,
  validateResolvedProductContext,
  validateSaasProductP2ModuleExports,
} from "../lib/saas-product";
import { buildOwnerContext, buildSupplierRepContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const moduleValidation = validateSaasProductP2ModuleExports();
  assert(moduleValidation.valid, "P2 module exports");
  console.log("✓ P2 module exports ok");

  const ownerCtx = buildOwnerContext();
  const context = resolveProductContext(ownerCtx, "kickstart-package");
  assert(validateProductContextShape(context), "product context shape");
  assert(validateResolvedProductContext(context, "kickstart-package"), "resolved product context");
  assert(context.tenantId === ownerCtx.tenantId, "tenantId bound");
  assert(context.workspaceId === ownerCtx.workspaceId, "workspaceId bound");
  assert(context.productDefinition.productCode === "kickstart-package", "product definition");
  assert(context.workflowStages.length === 2, "workflow stages");
  assert(context.v47ModuleMapping.productModule === "access-layer/quote", "v47 product module");
  assert(Boolean(context.v47ModuleMapping.workflowModules["commercial.quote"]), "v47 workflow module");
  assert(context.permissions.includes("quote:create"), "permissions resolved");
  assert(context.featureFlags.required["commercial.quote"] === true, "required feature flag");
  assert(typeof context.featureFlags.enabled["commercial.quote"] === "boolean", "enabled feature flag");
  assert(context.source.resolver === "resolveProductContext", "source metadata");
  console.log("✓ resolveProductContext ok");

  const tenant = bindTenantContext(ownerCtx);
  assert(tenant.tenantId === ownerCtx.tenantId, "bindTenantContext");
  console.log("✓ bindTenantContext ok");

  const workspace = bindWorkspaceContext({
    workspaceId: ownerCtx.workspaceId,
    productCode: "kickstart-package",
    portalType: "enterprise",
  });
  assert(workspace.workspaceBinding.status === "active", "bindWorkspaceContext");
  console.log("✓ bindWorkspaceContext ok");

  const product = bindProductContext(ownerCtx.tenantId, "delivery-intelligence-package", "enterprise");
  assert(product.workflowStages.length === 6, "bindProductContext workflows");
  console.log("✓ bindProductContext ok");

  let portalDenied = false;
  try {
    bindProductContext(ownerCtx.tenantId, "kickstart-package", "supplier");
  } catch (error) {
    portalDenied =
      error instanceof SaasProductContextError &&
      error.code === CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_PORTAL_INCOMPATIBLE;
  }
  assert(portalDenied, "portal incompatible denied");
  console.log("✓ portal compatibility ok");

  let workspaceDenied = false;
  try {
    resolveProductContext({ ...ownerCtx, workspaceId: undefined }, "kickstart-package");
  } catch (error) {
    workspaceDenied =
      error instanceof SaasProductContextError &&
      error.code === CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_WORKSPACE_REQUIRED;
  }
  assert(workspaceDenied, "workspace required denied");
  console.log("✓ workspace requirement ok");

  let supplierCatalogDenied = false;
  try {
    bindWorkspaceContext({
      workspaceId: "supplier-ws",
      productCode: "kickstart-package",
      portalType: "supplier",
    });
  } catch (error) {
    supplierCatalogDenied =
      error instanceof SaasProductContextError &&
      error.code === CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_CATALOG_INCOMPATIBLE;
  }
  assert(supplierCatalogDenied, "supplier catalog incompatible");
  console.log("✓ workspace catalog compatibility ok");

  const supplierCtx = buildSupplierRepContext();
  let supplierPortalDenied = false;
  try {
    resolveProductContext(supplierCtx, "kickstart-package");
  } catch (error) {
    supplierPortalDenied = error instanceof SaasProductContextError;
  }
  assert(supplierPortalDenied, "supplier product context denied");
  console.log("✓ supplier portal guard ok");

  const resolverSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "context", "resolve-product-context.ts"),
    "utf8",
  );
  assert(resolverSource.includes("bindTenantContext"), "resolver tenant bind");
  assert(resolverSource.includes("bindWorkspaceContext"), "resolver workspace bind");
  assert(resolverSource.includes("bindProductContext"), "resolver product bind");
  assert(resolverSource.includes("resolvePermissions"), "resolver rbac integration");
  assert(!resolverSource.includes("executeCommercialQuote"), "no workflow execution");
  assert(!resolverSource.includes("quote-service"), "no V47 runtime execution");
  console.log("✓ P2 boundary ok");

  console.log(`tag=${SAAS_PRODUCT_P2_TAG}`);
  console.log("SAAS PRODUCT P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
