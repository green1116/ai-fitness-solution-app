/**
 * V57 Quote Product — P3 Quote Product Service Layer verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V57_QUOTE_P3_VERIFY_CHECKS,
  WORKSPACE_QUOTE_PRODUCT_P3_META,
  WORKSPACE_QUOTE_PRODUCT_P3_TAG,
} from "@/lib/quote-product/freeze/v57-p3-meta";
import { WORKSPACE_QUOTE_PRODUCT_P3_FREEZE } from "@/lib/quote-product/freeze/v57-p3-final";
import { WORKSPACE_QUOTE_PRODUCT_P2_TAG } from "@/lib/quote-product/shared/quote-product-constants";
import {
  assertHasProductOrchestratorP3,
  assertHasProductServiceP3,
  assertHasRuntimeClientOnlyP3,
  assertHasWorkspaceResolverP3,
  assertMountedQuoteProductOrchestration,
  assertMountedQuoteProductServiceLayer,
  assertP3NoDirectExecutionImport,
  assertP3NoPrismaAccess,
  assertP3NoRepositoryAccess,
  assertP3NoRuntimeLayerMix,
  assertP3NoUILogicInService,
  validateQuoteProductP3,
} from "@/lib/quote-product/validation/validate-quote-product-p3";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteProductP3();
  assert(validation.valid, `P3 quote product service validation: ${validation.summary}`);
  console.log("✓ P3 quote product service validation ok");

  assert(assertHasProductServiceP3(), "HAS_PRODUCT_SERVICE");
  console.log("✓ HAS_PRODUCT_SERVICE");

  assert(existsSync(join(PRODUCT_ROOT, "service", "quote-product.orchestrator.ts")), "product orchestrator module");
  assert(assertHasProductOrchestratorP3(), "HAS_PRODUCT_ORCHESTRATOR");
  console.log("✓ HAS_PRODUCT_ORCHESTRATOR");

  assert(existsSync(join(PRODUCT_ROOT, "workspace", "quote-workspace.resolver.ts")), "workspace resolver module");
  assert(assertHasWorkspaceResolverP3(), "HAS_WORKSPACE_RESOLVER");
  console.log("✓ HAS_WORKSPACE_RESOLVER");

  assert(assertHasRuntimeClientOnlyP3(), "HAS_RUNTIME_CLIENT_ONLY");
  console.log("✓ HAS_RUNTIME_CLIENT_ONLY");

  assert(assertP3NoPrismaAccess(), "NO_PRISMA_ACCESS");
  console.log("✓ NO_PRISMA_ACCESS");

  assert(assertP3NoRepositoryAccess(), "NO_REPOSITORY_ACCESS");
  console.log("✓ NO_REPOSITORY_ACCESS");

  assert(assertP3NoDirectExecutionImport(), "NO_DIRECT_EXECUTION_IMPORT");
  console.log("✓ NO_DIRECT_EXECUTION_IMPORT");

  assert(assertP3NoUILogicInService(), "NO_UI_LOGIC_IN_SERVICE");
  console.log("✓ NO_UI_LOGIC_IN_SERVICE");

  assert(assertP3NoRuntimeLayerMix(), "NO_RUNTIME_LAYER_MIX");
  assert(assertMountedQuoteProductServiceLayer(), "product service layer mounted");
  assert(await assertMountedQuoteProductOrchestration(), "product orchestration mounted");
  console.log("✓ NO_RUNTIME_LAYER_MIX");

  assert(WORKSPACE_QUOTE_PRODUCT_P3_META.tag === WORKSPACE_QUOTE_PRODUCT_P3_TAG, "p3 meta tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P3_META.phase === "v57-quote-product-p3", "p3 meta phase");
  assert(WORKSPACE_QUOTE_PRODUCT_P3_META.dependencyTag === WORKSPACE_QUOTE_PRODUCT_P2_TAG, "p3 dependency tag");
  assert(WORKSPACE_QUOTE_PRODUCT_P3_FREEZE.status === "quote-product-service-layer", "p3 freeze status");
  assert(V57_QUOTE_P3_VERIFY_CHECKS.includes("HAS_PRODUCT_SERVICE"), "p3 verify checks");
  console.log("✓ quote product p3 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_PRODUCT_P3_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_PRODUCT_P2_TAG}`);
  console.log("V57 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
