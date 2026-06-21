/**
 * V57 Quote Product — P1 Quote Workspace Bootstrap UI verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P1_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P1_META,
  WORKSPACE_QUOTE_PRODUCT_P1_TAG,
} from "@/lib/quote-product/freeze/v57-p1-meta";
import { WORKSPACE_QUOTE_PRODUCT_P1_FREEZE } from "@/lib/quote-product/freeze/v57-p1-final";
import { WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasEntryLayer,
  assertHasExecutionBridge,
  assertHasProductLayer,
  assertHasProductService,
  assertHasWorkspaceUI,
  assertMountedQuoteRuntimeClientBridge,
  assertMountedQuoteWorkspaceBootstrap,
  assertNoDirectExecutionImport,
  assertNoPrismaAccess,
  assertNoRepositoryAccess,
  validateQuoteProductP1,
} from "@/lib/quote-product/validation/validate-quote-product-p1";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP1();
  assert(validation.valid, `P1 quote product validation: ${validation.summary}`);
  console.log("✓ P1 quote product validation ok");

  assert(existsSync(join(PRODUCT_ROOT, "index.ts")), "product layer index");
  assert(assertHasProductLayer(), "HAS_PRODUCT_LAYER");
  console.log("✓ HAS_PRODUCT_LAYER");

  assert(existsSync(join(PRODUCT_ROOT, "workspace", "quote-workspace.service.ts")), "workspace ui module");
  assert(assertHasWorkspaceUI(), "HAS_WORKSPACE_UI");
  assert(assertMountedQuoteWorkspaceBootstrap(), "workspace bootstrap mounted");
  console.log("✓ HAS_WORKSPACE_UI");

  assert(existsSync(join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts")), "entry layer module");
  assert(assertHasEntryLayer(), "HAS_ENTRY_LAYER");
  console.log("✓ HAS_ENTRY_LAYER");

  assert(existsSync(join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts")), "product service module");
  assert(assertHasProductService(), "HAS_PRODUCT_SERVICE");
  console.log("✓ HAS_PRODUCT_SERVICE");

  assert(existsSync(join(PRODUCT_ROOT, "integration", "quote-runtime.client.ts")), "execution bridge module");
  assert(assertHasExecutionBridge(), "HAS_EXECUTION_BRIDGE");
  assert(await assertMountedQuoteRuntimeClientBridge(), "execution bridge mounted");
  console.log("✓ HAS_EXECUTION_BRIDGE");

  assert(assertNoDirectExecutionImport(), "NO_DIRECT_EXECUTION_IMPORT");
  console.log("✓ NO_DIRECT_EXECUTION_IMPORT");

  assert(assertNoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertNoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(WORKSPACE_QUOTE_PRODUCT_P1_META.tag === WORKSPACE_QUOTE_PRODUCT_P1_TAG, "p1 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P1_META.phase === "v57-quote-product-p1", "p1 meta phase");
  assert(
    WORKSPACE_QUOTE_PRODUCT_P1_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG,
    "p1 dependency tag",
  );
  assert(WORKSPACE_QUOTE_PRODUCT_P1_FREEZE.status === "quote-workspace-bootstrap-ui", "p1 freeze status");
  assert(V57_QUOTE_P1_VERIFY_CHECKS.includes("HAS_PRODUCT_LAYER"), "p1 verify checks");
  console.log("✓ quote product p1 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P1_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_FINAL_DEPENDENCY_TAG}`);
  console.log("V57 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
