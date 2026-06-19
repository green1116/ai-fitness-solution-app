/**
 * V49 SaaS Product — Phase 3 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_P3_TAG,
  WORKSPACE_RUNTIME_ERROR_CODES,
  SaasWorkspaceProductError,
  bindWorkspaceProduct,
  clearWorkspaceProductRepository,
  createProductWorkspace,
  getWorkspaceProductRepositorySize,
  listWorkspaceProducts,
  mapSaasWorkspaceToV47CustomerWorkspace,
  resolveProductContext,
  resolveWorkspaceProduct,
  validateSaasProductP3Runtime,
  validateV47CustomerWorkspaceMapping,
  validateWorkspaceProductInstance,
} from "../lib/saas-product";
import { buildOwnerContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  clearWorkspaceProductRepository();

  const runtimeValidation = validateSaasProductP3Runtime();
  assert(runtimeValidation.valid, `P3 runtime validation: ${runtimeValidation.summary}`);
  console.log("✓ P3 runtime validation ok");

  const ownerCtx = buildOwnerContext();
  const context = resolveProductContext(ownerCtx, "delivery-intelligence-package");
  const created = createProductWorkspace({ context, status: "draft" });
  assert(created.status === "draft", "createProductWorkspace status");
  assert(created.productCode === "delivery-intelligence-package", "createProductWorkspace product");
  assert(validateWorkspaceProductInstance(created), "workspace product instance");
  console.log("✓ createProductWorkspace ok");

  const resolved = resolveWorkspaceProduct(created.workspaceProductId);
  assert(resolved.workspaceProductId === created.workspaceProductId, "resolveWorkspaceProduct");
  console.log("✓ resolveWorkspaceProduct ok");

  const listed = listWorkspaceProducts(ownerCtx.tenantId);
  assert(listed.length === 1, "listWorkspaceProducts");
  console.log("✓ listWorkspaceProducts ok");

  const bound = bindWorkspaceProduct({
    context,
    workspaceProductId: created.workspaceProductId,
    status: "active",
  });
  assert(bound.status === "active", "bindWorkspaceProduct status");
  assert(bound.productContextSnapshot.productCode === context.productCode, "bindWorkspaceProduct snapshot");
  console.log("✓ bindWorkspaceProduct ok");

  const v47Workspace = mapSaasWorkspaceToV47CustomerWorkspace(bound);
  assert(v47Workspace.customerId === bound.tenantId, "v47 customerId mapping");
  assert(v47Workspace.workspaceId === bound.v47CustomerWorkspaceMapping.v47WorkspaceId, "v47 workspaceId mapping");
  assert(Array.isArray(v47Workspace.projects), "v47 workspace skeleton projects");
  assert(validateV47CustomerWorkspaceMapping(bound.v47CustomerWorkspaceMapping), "v47 mapping validation");
  console.log("✓ mapSaasWorkspaceToV47CustomerWorkspace ok");

  let duplicateDenied = false;
  try {
    createProductWorkspace({ context, status: "draft" });
  } catch (error) {
    duplicateDenied =
      error instanceof SaasWorkspaceProductError &&
      error.code === WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_ALREADY_EXISTS;
  }
  assert(duplicateDenied, "duplicate workspace product denied");
  console.log("✓ duplicate guard ok");

  const runtimeSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "workspace-runtime", "workspace-product-runtime.ts"),
    "utf8",
  );
  assert(runtimeSource.includes("assertValidProductContextForWorkspace"), "context validation integration");
  assert(runtimeSource.includes("resolveProductContext") === false, "runtime does not call resolveProductContext directly");
  assert(!runtimeSource.includes("executeCommercialQuote"), "no quote workflow execution");
  assert(!runtimeSource.includes("quote-service"), "no V47 runtime execution");
  console.log("✓ P3 boundary ok");

  clearWorkspaceProductRepository();
  assert(getWorkspaceProductRepositorySize() === 0, "repository cleared");

  console.log(`tag=${SAAS_PRODUCT_P3_TAG}`);
  console.log("SAAS PRODUCT P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
