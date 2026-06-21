/**
 * V57 Quote Product — P5 Quote UI State Mapping verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P5_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P5_META,
  WORKSPACE_QUOTE_PRODUCT_P5_TAG,
} from "@/lib/quote-product/freeze/v57-p5-meta";
import { WORKSPACE_QUOTE_PRODUCT_P5_FREEZE } from "@/lib/quote-product/freeze/v57-p5-final";
import { WORKSPACE_QUOTE_PRODUCT_P4_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasErrorSurfaceP5,
  assertHasLoadingStateP5,
  assertHasReadinessP5,
  assertHasUIStateP5,
  assertHasUIMapperP5,
  assertHasViewModelP5,
  assertMountedQuoteUIStateBridge,
  assertMountedQuoteUIStateMapping,
  assertP5NoExecutionLogic,
  assertP5NoPrismaAccess,
  assertP5NoRepositoryAccess,
  assertP5NoRuntimeImport,
  validateQuoteProductP5,
} from "@/lib/quote-product/validation/validate-quote-product-p5";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP5();
  assert(validation.valid, `P5 quote UI state mapping validation: ${validation.summary}`);
  console.log("✓ P5 quote UI state mapping validation ok");

  assert(existsSync(join(PRODUCT_ROOT, "ui", "quote-ui-state.mapper.ts")), "ui state mapper module");
  assert(assertHasUIStateP5(), "HAS_UI_STATE");
  console.log("✓ HAS_UI_STATE");

  assert(assertHasUIMapperP5(), "HAS_UI_MAPPER");
  console.log("✓ HAS_UI_MAPPER");

  assert(existsSync(join(PRODUCT_ROOT, "ui", "quote-ui-view.model.ts")), "ui view model module");
  assert(assertHasViewModelP5(), "HAS_VIEW_MODEL");
  console.log("✓ HAS_VIEW_MODEL");

  assert(assertHasReadinessP5(), "HAS_READINESS");
  console.log("✓ HAS_READINESS");

  assert(assertHasLoadingStateP5(), "HAS_LOADING_STATE");
  console.log("✓ HAS_LOADING_STATE");

  assert(assertHasErrorSurfaceP5(), "HAS_ERROR_SURFACE");
  console.log("✓ HAS_ERROR_SURFACE");

  assert(assertP5NoRuntimeImport(), "NO_RUNTIME_IMPORT");
  console.log("✓ NO_RUNTIME_IMPORT");

  assert(assertP5NoExecutionLogic(), "NO_EXECUTION_LOGIC");
  console.log("✓ NO_EXECUTION_LOGIC");

  assert(assertP5NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP5NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertMountedQuoteUIStateMapping(), "ui state mapping mounted");
  assert(assertMountedQuoteUIStateBridge(), "ui state bridge mounted");
  console.log("✓ ui state boundary mounted");

  assert(WORKSPACE_QUOTE_PRODUCT_P5_META.tag === WORKSPACE_QUOTE_PRODUCT_P5_TAG, "p5 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P5_META.phase === "v57-quote-product-p5", "p5 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P5_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P4_TAG, "p5 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P5_FREEZE.status === "quote-ui-state-mapping", "p5 freeze status");
  assert(V57_QUOTE_P5_VERIFY_CHECKS.includes("HAS_UI_STATE"), "p5 verify checks");
  console.log("✓ quote product p5 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P5_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P4_TAG}`);
  console.log("V57 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
