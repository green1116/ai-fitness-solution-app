/**
 * V57 Quote Product — P4 Quote Execution Client Layer verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P4_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P4_META,
  WORKSPACE_QUOTE_PRODUCT_P4_TAG,
} from "@/lib/quote-product/freeze/v57-p4-meta";
import { WORKSPACE_QUOTE_PRODUCT_P4_FREEZE } from "@/lib/quote-product/freeze/v57-p4-final";
import { WORKSPACE_QUOTE_PRODUCT_P3_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasExecutionAdapterP4,
  assertHasExecutionClientP4,
  assertHasExecutionErrorP4,
  assertHasExecutionErrorTypeP4,
  assertHasExecutionMapperP4,
  assertHasExecutionRequestP4,
  assertHasExecutionResponseP4,
  assertHasExecutionValidationP4,
  assertMountedQuoteExecutionClientLayer,
  assertMountedQuoteExecutionRuntimeBridge,
  assertP4NoDirectRuntimeImport,
  assertP4NoPrismaAccess,
  assertP4NoRepositoryAccess,
  assertP4NoRuntimeLayerMix,
  assertP4NoUILogicInExecution,
  assertProductExecutionRoutesThroughClientP4,
  validateQuoteProductP4,
} from "@/lib/quote-product/validation/validate-quote-product-p4";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP4();
  assert(validation.valid, `P4 quote execution client validation: ${validation.summary}`);
  console.log("✓ P4 quote execution client validation ok");

  assert(existsSync(join(PRODUCT_ROOT, "execution", "quote-execution.client.ts")), "execution client module");
  assert(assertHasExecutionClientP4(), "HAS_EXECUTION_CLIENT");
  console.log("✓ HAS_EXECUTION_CLIENT");

  assert(assertHasExecutionAdapterP4(), "HAS_EXECUTION_ADAPTER");
  console.log("✓ HAS_EXECUTION_ADAPTER");

  assert(assertHasExecutionRequestP4(), "HAS_EXECUTION_REQUEST");
  console.log("✓ HAS_EXECUTION_REQUEST");

  assert(assertHasExecutionResponseP4(), "HAS_EXECUTION_RESPONSE");
  console.log("✓ HAS_EXECUTION_RESPONSE");

  assert(assertHasExecutionErrorTypeP4(), "HAS_EXECUTION_ERROR type");
  assert(assertHasExecutionErrorP4(), "HAS_EXECUTION_ERROR");
  console.log("✓ HAS_EXECUTION_ERROR");

  assert(assertHasExecutionMapperP4(), "HAS_EXECUTION_MAPPER");
  console.log("✓ HAS_EXECUTION_MAPPER");

  assert(assertHasExecutionValidationP4(), "HAS_EXECUTION_VALIDATION");
  console.log("✓ HAS_EXECUTION_VALIDATION");

  assert(assertP4NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP4NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP4NoDirectRuntimeImport(), "NO_DIRECT_RUNTIME_IMPORT");
  console.log("✓ NO_DIRECT_RUNTIME_IMPORT");

  assert(assertP4NoUILogicInExecution(), "NO_UI_LOGIC_IN_EXECUTION");
  console.log("✓ NO_UI_LOGIC_IN_EXECUTION");

  assert(assertP4NoRuntimeLayerMix(), "NO_RUNTIME_LAYER_MIX");
  assert(assertProductExecutionRoutesThroughClientP4(), "product execution routes through client");
  assert(assertMountedQuoteExecutionClientLayer(), "execution client layer mounted");
  assert(await assertMountedQuoteExecutionRuntimeBridge(), "execution runtime bridge mounted");
  console.log("✓ NO_RUNTIME_LAYER_MIX");

  assert(WORKSPACE_QUOTE_PRODUCT_P4_META.tag === WORKSPACE_QUOTE_PRODUCT_P4_TAG, "p4 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P4_META.phase === "v57-quote-product-p4", "p4 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P4_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P3_TAG, "p4 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P4_FREEZE.status === "quote-execution-client-layer", "p4 freeze status");
  assert(V57_QUOTE_P4_VERIFY_CHECKS.includes("HAS_EXECUTION_CLIENT"), "p4 verify checks");
  console.log("✓ quote product p4 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P4_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P3_TAG}`);
  console.log("V57 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
