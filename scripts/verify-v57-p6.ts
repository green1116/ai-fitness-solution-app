/**
 * V57 Quote Product — P6 Quote Product Surface Assembly verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P6_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P6_META,
  WORKSPACE_QUOTE_PRODUCT_P6_TAG,
} from "@/lib/quote-product/freeze/v57-p6-meta";
import { WORKSPACE_QUOTE_PRODUCT_P6_FREEZE } from "@/lib/quote-product/freeze/v57-p6-final";
import { WORKSPACE_QUOTE_PRODUCT_P5_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasPortalSurfaceP6,
  assertHasProductSurfaceP6,
  assertHasSurfaceActionsP6,
  assertHasSurfaceLoaderP6,
  assertHasSurfaceStateP6,
  assertHasSurfaceViewModelP6,
  assertHasWorkspaceSurfaceP6,
  assertMountedQuoteProductSurfaceActions,
  assertMountedQuoteProductSurfaceAssembly,
  assertP6NoExecutionLogic,
  assertP6NoPrismaAccess,
  assertP6NoRepositoryAccess,
  assertP6NoRuntimeImport,
  assertPortalDoesNotBypassSurfaceP6,
  validateQuoteProductP6,
} from "@/lib/quote-product/validation/validate-quote-product-p6";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP6();
  assert(validation.valid, `P6 quote product surface validation: ${validation.summary}`);
  console.log("✓ P6 quote product surface validation ok");

  assert(existsSync(join(PRODUCT_ROOT, "surface", "quote-product.surface.ts")), "product surface module");
  assert(assertHasProductSurfaceP6(), "HAS_PRODUCT_SURFACE");
  console.log("✓ HAS_PRODUCT_SURFACE");

  assert(assertHasSurfaceLoaderP6(), "HAS_SURFACE_LOADER");
  console.log("✓ HAS_SURFACE_LOADER");

  assert(assertHasSurfaceViewModelP6(), "HAS_SURFACE_VIEWMODEL");
  console.log("✓ HAS_SURFACE_VIEWMODEL");

  assert(assertHasSurfaceStateP6(), "HAS_SURFACE_STATE");
  console.log("✓ HAS_SURFACE_STATE");

  assert(assertHasSurfaceActionsP6(), "HAS_SURFACE_ACTIONS");
  console.log("✓ HAS_SURFACE_ACTIONS");

  assert(assertHasWorkspaceSurfaceP6(), "HAS_WORKSPACE_SURFACE");
  console.log("✓ HAS_WORKSPACE_SURFACE");

  assert(assertHasPortalSurfaceP6(), "HAS_PORTAL_SURFACE");
  assert(assertPortalDoesNotBypassSurfaceP6(), "portal consumes surface only");
  console.log("✓ HAS_PORTAL_SURFACE");

  assert(assertP6NoRuntimeImport(), "NO_RUNTIME_IMPORT");
  console.log("✓ NO_RUNTIME_IMPORT");

  assert(assertP6NoExecutionLogic(), "NO_EXECUTION_LOGIC");
  console.log("✓ NO_EXECUTION_LOGIC");

  assert(assertP6NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP6NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertMountedQuoteProductSurfaceAssembly(), "product surface assembly mounted");
  assert(await assertMountedQuoteProductSurfaceActions(), "product surface actions mounted");
  console.log("✓ product surface boundary mounted");

  assert(WORKSPACE_QUOTE_PRODUCT_P6_META.tag === WORKSPACE_QUOTE_PRODUCT_P6_TAG, "p6 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P6_META.phase === "v57-quote-product-p6", "p6 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P6_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P5_TAG, "p6 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P6_FREEZE.status === "quote-product-surface-assembly", "p6 freeze status");
  assert(V57_QUOTE_P6_VERIFY_CHECKS.includes("HAS_PRODUCT_SURFACE"), "p6 verify checks");
  console.log("✓ quote product p6 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P6_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P5_TAG}`);
  console.log("V57 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
