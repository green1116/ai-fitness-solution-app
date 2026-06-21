/**
 * V57 Quote Product — P2 Quote Entry Layer verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P2_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P2_META,
  WORKSPACE_QUOTE_PRODUCT_P2_TAG,
} from "@/lib/quote-product/freeze/v57-p2-meta";
import { WORKSPACE_QUOTE_PRODUCT_P2_FREEZE } from "@/lib/quote-product/freeze/v57-p2-final";
import { WORKSPACE_QUOTE_PRODUCT_P1_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasEntryController,
  assertHasEntryLayerP2,
  assertHasEntryMapper,
  assertHasEntryUIState,
  assertHasEntryValidationModule,
  assertMountedQuoteEntryLayer,
  assertMountedQuoteEntrySubmission,
  assertP2NoDirectExecutionImport,
  assertP2NoPrismaAccess,
  assertP2NoRepositoryAccess,
  assertP2NoRuntimeLayerMix,
  validateQuoteProductP2,
} from "@/lib/quote-product/validation/validate-quote-product-p2";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP2();
  assert(validation.valid, `P2 quote entry layer validation: ${validation.summary}`);
  console.log("✓ P2 quote entry layer validation ok");

  assert(assertHasEntryLayerP2(), "HAS_ENTRY_LAYER");
  console.log("✓ HAS_ENTRY_LAYER");

  assert(existsSync(join(PRODUCT_ROOT, "entry", "quote-entry.controller.ts")), "entry controller module");
  assert(assertHasEntryController(), "HAS_ENTRY_CONTROLLER");
  console.log("✓ HAS_ENTRY_CONTROLLER");

  assert(existsSync(join(PRODUCT_ROOT, "entry", "quote-entry.mapper.ts")), "entry mapper module");
  assert(assertHasEntryMapper(), "HAS_ENTRY_MAPPER");
  console.log("✓ HAS_ENTRY_MAPPER");

  assert(assertHasEntryUIState(), "HAS_ENTRY_UI_STATE");
  console.log("✓ HAS_ENTRY_UI_STATE");

  assert(existsSync(join(PRODUCT_ROOT, "entry", "quote-entry.validation.ts")), "entry validation module");
  assert(assertHasEntryValidationModule(), "HAS_ENTRY_VALIDATION");
  console.log("✓ HAS_ENTRY_VALIDATION");

  assert(assertP2NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP2NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP2NoDirectExecutionImport(), "NO_DIRECT_EXECUTION_IMPORT");
  console.log("✓ NO_DIRECT_EXECUTION_IMPORT");

  assert(assertP2NoRuntimeLayerMix(), "NO_RUNTIME_LAYER_MIX");
  assert(assertMountedQuoteEntryLayer(), "entry layer mounted");
  assert(await assertMountedQuoteEntrySubmission(), "entry submission mounted");
  console.log("✓ NO_RUNTIME_LAYER_MIX");

  assert(WORKSPACE_QUOTE_PRODUCT_P2_META.tag === WORKSPACE_QUOTE_PRODUCT_P2_TAG, "p2 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P2_META.phase === "v57-quote-product-p2", "p2 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P2_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P1_TAG, "p2 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P2_FREEZE.status === "quote-entry-layer", "p2 freeze status");
  assert(V57_QUOTE_P2_VERIFY_CHECKS.includes("HAS_ENTRY_CONTROLLER"), "p2 verify checks");
  console.log("✓ quote product p2 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P2_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P1_TAG}`);
  console.log("V57 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
