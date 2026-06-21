/**
 * V57 Quote Product — Final Freeze verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_PRODUCT_FROZEN,
  V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_FINAL_META,
  WORKSPACE_QUOTE_PRODUCT_FINAL_TAG,
  WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION,
  WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE,
} from "@/lib/quote-product/freeze/v57-p8-meta";
import { V57_PRODUCT_LOCKED } from "@/lib/quote-product/freeze/v57-p8-meta";
import { WORKSPACE_QUOTE_PRODUCT_P8_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasFinalFreezeFileP8,
  assertV57ProductFrozen,
  assertV57ProductLocked,
  validateQuoteProductFinal,
} from "@/lib/quote-product/validation/validate-quote-product-p8";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductFinal();
  assert(validation.valid, `V57 final quote product validation: ${validation.summary}`);
  console.log("✓ V57 quote product final validation ok");

  assert(existsSync(join(PRODUCT_ROOT, "freeze", "v57-final-frozen.ts")), "v57-final-frozen file");
  assert(existsSync(join(PRODUCT_ROOT, "freeze", "v57-p8-meta.ts")), "v57-p8-meta file");

  assert(assertV57ProductFrozen(), "V57_PRODUCT_FROZEN");
  console.log(`✓ ${V57_PRODUCT_FROZEN}`);

  assert(await assertV57ProductLocked(), "V57_PRODUCT_LOCKED");
  console.log(`✓ ${V57_PRODUCT_LOCKED}`);

  assert(assertHasFinalFreezeFileP8(), "HAS_FINAL_FREEZE_FILE");
  console.log("✓ HAS_FINAL_FREEZE_FILE");

  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.tag === WORKSPACE_QUOTE_PRODUCT_FINAL_TAG, "final meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.version === WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION, "final meta version");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.state === "FROZEN", "final meta state");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.frozen === true, "final meta frozen");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.layers === 8, "final meta layers");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_META.productFrozen === V57_PRODUCT_FROZEN, "final product frozen token");
  assert(WORKSPACE_QUOTE_PRODUCT_FINAL_FREEZE.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P8_TAG, "final dependency tag");
  assert(V57_QUOTE_PRODUCT_FINAL_VERIFY_CHECKS.includes("V57_PRODUCT_FROZEN"), "final verify checks");
  console.log("✓ quote product final meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_FINAL_TAG}`);
  console.log(`version=${WORKSPACE_QUOTE_PRODUCT_FINAL_VERSION}`);
  console.log(`state=${WORKSPACE_QUOTE_PRODUCT_FINAL_META.state}`);
  console.log("V57 FINAL FREEZE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
