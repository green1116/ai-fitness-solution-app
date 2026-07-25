/**
 * Product Complete — verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ENTERPRISE_PRODUCT_COMPLETE_ID,
  isProductCompleteFreezeLockIntact,
  PRODUCT_COMPLETE_FREEZE_LOCK,
  PRODUCT_COMPLETE_ID,
} from "../lib/product/complete/freeze/freeze.lock";
import {
  assertProductCompleteReleaseGatePass,
  checkProductCompleteReleaseGate,
} from "../lib/product/complete/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== Product Complete Freeze ===");
  check(
    fs.existsSync(path.join(ROOT, "lib/product/complete/freeze/freeze.lock.ts")),
    "missing freeze.lock",
  );
  check(
    PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1",
    "complete id",
  );
  check(
    ENTERPRISE_PRODUCT_COMPLETE_ID === PRODUCT_COMPLETE_ID,
    "complete alias",
  );
  check(isProductCompleteFreezeLockIntact(PRODUCT_COMPLETE_FREEZE_LOCK), "lock intact");
  console.log("✓ freeze lock");
  const gate = checkProductCompleteReleaseGate();
  check(gate.result === "PASS", gate.summary);
  assertProductCompleteReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
  console.log("ALL PASS");
}

main();
