/**
 * V49 SaaS Product — Phase 1 verification
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { PRODUCT_SKU } from "../lib/commercial-products/shared/constants";
import {
  SAAS_PRODUCT_P1_TAG,
  assertProductRegistryAlignedWithV47,
  assertV48LayersUnmodified,
  listProducts,
  listProductsForPortal,
  listWorkflowStages,
  listWorkspaceProductsForPortal,
  mapProductToV47Module,
  mapWorkflowToV47Module,
  resolveProduct,
  resolveWorkflowStage,
  validateSaasProductP1,
  validateWorkspaceProductBinding,
} from "../lib/saas-product";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = validateSaasProductP1();
  assert(validation.productCount === 3, "three products registered");
  assert(validation.workflowCount === 6, "six workflow stages");
  assert(validation.v47SkuAligned, "V47 SKU alignment");
  assert(validation.boundaryClean, "saas-product boundary clean");
  assert(validation.valid, `static validation: ${validation.summary}`);
  console.log("✓ product registry ok");

  for (const sku of PRODUCT_SKU) {
    const product = resolveProduct(sku);
    assert(product.v47Sku === sku, `product v47 sku ${sku}`);
    assert(product.workflowKeys.length >= 2, `product workflows ${sku}`);
  }
  assert(assertProductRegistryAlignedWithV47(), "catalog alignment");
  console.log("✓ V47 product catalog alignment ok");

  const workflows = listWorkflowStages();
  assert(workflows.length === 6, "workflow catalog count");
  assert(resolveWorkflowStage("commercial.quote").stages.length === 3, "quote stages");
  assert(resolveWorkflowStage("commercial.release").v47Module === "release/", "release module");
  console.log("✓ workflow stage catalog ok");

  const enterpriseProducts = listProductsForPortal("enterprise");
  assert(enterpriseProducts.length === 3, "enterprise portal products");
  assert(listWorkspaceProductsForPortal("enterprise").length === 3, "enterprise workspace catalog");
  assert(listWorkspaceProductsForPortal("supplier").length === 0, "supplier reserved catalog");
  console.log("✓ workspace product catalog ok");

  assert(mapProductToV47Module("kickstart-package") === "access-layer/quote", "product mapper");
  assert(mapWorkflowToV47Module("commercial.delivery") === "orchestration/", "workflow mapper");
  console.log("✓ V47 module mapper ok");

  assert(
    validateWorkspaceProductBinding({
      saasWorkspaceId: "ws-demo",
      productCode: "kickstart-package",
      status: "active",
    }),
    "workspace binding validation",
  );
  console.log("✓ workspace product binding validation ok");

  assert(assertV48LayersUnmodified(), "V48 layers present");
  const v47Diff = execSync("git diff --name-only -- lib/commercial-products", {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  assert(v47Diff.length === 0, "V47 commercial-products unchanged");

  const productRoot = join(process.cwd(), "lib", "saas-product");
  const productSources = readFileSync(join(productRoot, "registry", "product-registry.ts"), "utf8");
  assert(productSources.includes("buildProductCatalog"), "product registry reads V47 catalog");
  assert(!productSources.includes("quote-service"), "no V47 runtime import in registry");
  console.log("✓ boundary validation ok");

  console.log(`tag=${SAAS_PRODUCT_P1_TAG}`);
  console.log("SAAS PRODUCT P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
