/**
 * V57 Quote Product — P8 Full Portal Verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_PRODUCT_LOCKED,
  V57_QUOTE_P8_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P8_META,
  WORKSPACE_QUOTE_PRODUCT_P8_TAG,
} from "@/lib/quote-product/freeze/v57-p8-meta";
import { WORKSPACE_QUOTE_PRODUCT_P7_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertAllQuoteProductPhasesPass,
  assertHasFinalFreezeFileP8,
  assertV57ProductFrozen,
  assertV57ProductLocked,
  validateQuoteProductP8,
} from "@/lib/quote-product/validation/validate-quote-product-p8";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP8();
  assert(validation.valid, `P8 full portal verification: ${validation.summary}`);
  console.log("✓ P8 full portal verification ok");

  const phases = await assertAllQuoteProductPhasesPass();
  for (const [phase, passed] of Object.entries(phases)) {
    assert(passed, `ALL_PHASES_PASS:${phase}`);
    console.log(`✓ ALL_PHASES_PASS:${phase}`);
  }

  assert(assertHasFinalFreezeFileP8(), "HAS_FINAL_FREEZE_FILE");
  console.log("✓ HAS_FINAL_FREEZE_FILE");

  assert(assertV57ProductFrozen(), "V57_PRODUCT_FROZEN");
  console.log("✓ V57_PRODUCT_FROZEN");

  assert(await assertV57ProductLocked(), "V57_PRODUCT_LOCKED");
  console.log("✓ V57_PRODUCT_LOCKED");

  assert(existsSync(join(PRODUCT_ROOT, "freeze", "v57-final-frozen.ts")), "v57-final-frozen file");
  assert(existsSync(join(PRODUCT_ROOT, "integration-check", "v57-p7-route-audit.ts")), "route audit module");
  assert(existsSync(join(PRODUCT_ROOT, "integration-check", "v57-p7-bypass-check.ts")), "bypass check module");

  assert(WORKSPACE_QUOTE_PRODUCT_P8_META.tag === WORKSPACE_QUOTE_PRODUCT_P8_TAG, "p8 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P8_META.phase === "v57-quote-product-p8", "p8 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P8_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P7_TAG, "p8 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P8_META.productLocked === V57_PRODUCT_LOCKED, "p8 product locked token");
  assert(V57_QUOTE_P8_VERIFY_CHECKS.includes("ALL_PHASES_PASS"), "p8 verify checks");
  console.log("✓ quote product p8 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P8_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P7_TAG}`);
  console.log("V57 P8 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
